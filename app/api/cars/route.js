import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const cars = await db.collection("cars").find({}).toArray();
    return NextResponse.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const data = await request.json();
    const result = await db.collection("cars").insertOne(data);
    return NextResponse.json({ message: "Car added", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error adding car:", error);
    return NextResponse.json({ error: "Failed to add car" }, { status: 500 });
  }
}
