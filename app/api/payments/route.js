import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");

    const payments = await db.collection("payments").find({}).toArray();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const paymentData = await request.json();

    const result = await db.collection("payments").insertOne(paymentData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id, ...updateData } = await request.json();

    const result = await db.collection("payments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating payment:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id } = await request.json();

    const result = await db.collection("payments").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting payment:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}