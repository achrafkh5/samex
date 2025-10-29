import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const pinned = searchParams.get('pinned');
    const limit = searchParams.get('limit');
    const recent = searchParams.get('recent');
    
    let query = {};
    let sort = {};
    
    // Filter for pinned cars
    if (pinned === 'true') {
      query.isPinned = true;
    }
    
    // Sort by creation date for recent cars
    if (recent === 'true') {
      sort.createdAt = -1;
    }
    
    let cursor = db.collection("cars").find(query);
    
    if (Object.keys(sort).length > 0) {
      cursor = cursor.sort(sort);
    }
    
    if (limit) {
      cursor = cursor.limit(parseInt(limit));
    }
    
    const cars = await cursor.toArray();
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
