import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("dreamcars");

  try {
    const payments = await db.collection("payments").find({}).toArray();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.error();
  }
}

export async function POST(request) {
  const client = await clientPromise;
  const db = client.db("dreamcars");
  const paymentData = await request.json();

  try {
    const result = await db.collection("payments").insertOne(paymentData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.error();
  }
}

export async function PUT(request) {
  const client = await clientPromise;
  const db = client.db("dreamcars");
  const { id, ...updateData } = await request.json();

  try {
    const result = await db.collection("payments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.error();
  }
}
export async function DELETE(request) {
  const client = await clientPromise;
  const db = client.db("dreamcars");
  const { id } = await request.json();

  try {
    const result = await db.collection("payments").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.error();
  }
}