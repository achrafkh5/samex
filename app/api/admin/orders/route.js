import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const orderData = await request.json();

    const result = await db.collection("orders").insertOne(orderData);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    // Fetch orders for the authenticated user
    const orders = await db
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}