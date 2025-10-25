import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const clients = await db.collection("clients").find({}).toArray();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const data = await request.json();
    const result = await db.collection("clients").insertOne(data);
    return NextResponse.json({ message: "Client added", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error adding client:", error);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
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
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}

export async function PUT(request) {
    try {
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
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}
