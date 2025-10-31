import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db('dreamcars');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }

    const entries = await db
      .collection('finance_entries')
      .find({ type })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching finance entries:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db('dreamcars');
    const body = await request.json();

    const { type, fields, totalCost, netProfit, linkedOrderId } = body;

    if (!type || !fields || totalCost === undefined || netProfit === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = {
      type,
      fields,
      totalCost,
      netProfit,
      createdAt: new Date(),
    };

    // Add linkedOrderId if provided (for online orders)
    if (linkedOrderId) {
      entry.linkedOrderId = linkedOrderId;
    }

    const result = await db.collection('finance_entries').insertOne(entry);

    return NextResponse.json({
      message: 'Entry created successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating finance entry:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db('dreamcars');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const { type, fields, totalCost, netProfit, linkedOrderId } = body;

    if (!type || !fields || totalCost === undefined || netProfit === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData = {
      type,
      fields,
      totalCost,
      netProfit,
      updatedAt: new Date(),
    };

    // Add linkedOrderId if provided (for online orders)
    if (linkedOrderId) {
      updateData.linkedOrderId = linkedOrderId;
    }

    const result = await db.collection('finance_entries').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry updated successfully' });
  } catch (error) {
    console.error('Error updating finance entry:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db('dreamcars');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const result = await db.collection('finance_entries').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting finance entry:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
