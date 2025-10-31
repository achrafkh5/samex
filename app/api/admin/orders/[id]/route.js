import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const order = await db.collection("orders").findOne({ clientId: params.id });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db("dreamcars");
    const result = await db.collection("orders").deleteOne({ clientId: params.id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to delete order" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

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
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 });
  }
}