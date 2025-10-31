import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyAdmin } from '@/lib/auth';

// DELETE - Delete document by ID
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    const { id } = await params;
    
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
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
