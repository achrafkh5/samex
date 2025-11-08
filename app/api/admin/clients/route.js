import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const clientInfo = await db.collection("clients").find({}).sort({ createdAt: -1 }).toArray();

    if (!clientInfo || clientInfo.length === 0) {
      return NextResponse.json({  message: 'No client info found' }, { status: 404 });
    }
    
    return NextResponse.json(clientInfo);
  } catch (error) {
    console.error("Error fetching client info:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch client info" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const data = await request.json();
    
    // Add createdAt timestamp
    const clientData = {
      ...data,
      createdAt: new Date()
    };
    
    const result = await db.collection("clients").insertOne(clientData);
    return NextResponse.json({ message: "Client added", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error adding client:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id } = await request.json();
    if (!id) {
        return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }
    const result = await db.collection("clients").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Client deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}

export async function PUT(request) {
    try {
        // Verify admin authentication
        await verifyAdmin();

        const client = await clientPromise;
        const db = client.db("dreamcars");
        const { id, ...updateData } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
        }
        const result = await db.collection("clients").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Client updated" }, { status: 200 });
    } catch (error) {
        console.error("Error updating client:", error);
        if (error.message.includes("authenticated") || error.message.includes("token")) {
          return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}
