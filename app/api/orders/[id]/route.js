import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const order = await db.collection("orders").findOne({ clientId: params.id });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order" });
  }
}
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const result = await db.collection("orders").deleteOne({ clientId: params.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ success: false, error: "Failed to delete order" });
  }
}
export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const updatedData = await request.json();
    const orderId = await params.id;

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updatedData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: "Order not found or no changes made" });
    }

    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ success: false, error: "Failed to update order" });
  }
}