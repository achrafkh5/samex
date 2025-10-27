import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getAuthUser } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const orderData = await request.json();

    const result = await db.collection("orders").insertOne(orderData);

    return NextResponse.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" });
  }
}

export async function GET(request) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("dreamcars");
    
    // Fetch orders for the authenticated user
    const orders = await db
      .collection('orders')
      .find({ userId: authUser.userId })
      .toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}