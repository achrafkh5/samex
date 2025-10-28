import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from '@/app/lib/auth';

// GET - Fetch all documents
export async function GET(request) {
  try {

    const client = await clientPromise;
    const db = client.db("dreamcars");

    const documents = await db.collection("documents")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(documents);
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Create new document
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    const body = await request.json();
    const { 
      type, 
      clientId, 
      carId, 
      orderId, 
      clientName, 
      url, 
      userId,
      cloudinaryPublicId,
      cloudinaryResourceType
    } = body;
    
    // Validate required fields
    if (!type || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: type, url' },
        { status: 400 }
      );
    }
    
    const document = {
      type,
      userId,
      clientId,
      carId,
      orderId,
      clientName,
      url,
      cloudinaryPublicId,
      cloudinaryResourceType,
      status: 'active',
      createdAt: new Date()
    };
    
    const result = await db.collection("documents").insertOne(document);
    
    console.log('✅ Document created:', result.insertedId);
    return NextResponse.json({ 
      message: 'Document saved successfully', 
      id: result.insertedId,
      ...document 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const result = await db.collection("documents").deleteOne({ 
      _id: new ObjectId(id) 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Document deleted:', id);
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

// PUT - Update document
export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const body = await request.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required for update' },
        { status: 400 }
      );
    } 

    const result = await db.collection("documents").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found or no changes made' },
        { status: 404 }
      );
    }

    console.log('✅ Document updated:', id);
    return NextResponse.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('❌ Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}