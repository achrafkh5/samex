import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("dreamcars");
        console.log("Fetching car with ID:", id);
        const car = await db.collection("cars").findOne({ _id: new ObjectId(id) });
        if (!car) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }
        return NextResponse.json(car);
    } catch (error) {
        console.error("Error fetching car:", error);
        return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("dreamcars");
        const result = await db.collection("cars").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Car deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting car:", error);
        return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("dreamcars");
        const updateData = await request.json();
        
        // Remove createdAt from update data if it exists to preserve original
        delete updateData.createdAt;
        
        // Add updatedAt timestamp
        updateData.updatedAt = new Date();
        
        const result = await db.collection("cars").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Car not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Car updated" }, { status: 200 });
    } catch (error) {
        console.error("Error updating car:", error);
        return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
    }
}
