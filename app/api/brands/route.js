import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const brands = await db.collection("brands").find({}).toArray();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const data = await request.json();

    const result = await db.collection("brands").insertOne(data);
    const insertedBrand = await db.collection("brands").findOne({ _id: result.insertedId });

    return NextResponse.json(insertedBrand, { status: 201 });
  } catch (error) {
    console.error("Error adding brand:", error);
    return NextResponse.json({ error: "Failed to add brand" }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }
    const result = await db.collection("brands").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Brand deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id, ...updateData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }
    const result = await db.collection("brands").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return NextResponse.json({ message: "Brand updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}
