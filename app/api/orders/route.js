import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

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
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const orders = await db.collection("orders").find({}).toArray();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" });
  }
}