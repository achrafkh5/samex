import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyAdmin } from '@/lib/auth';

async function getClientById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const objectId = new ObjectId(id);
    const clientData = await db.collection("clients").findOne({ _id: objectId });
    return clientData;
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const { id } = params;
    const client = await getClientById(id);

    if (!client) {
      return new Response('Client not found', { status: 404 });
    }

    return new Response(JSON.stringify({ client }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error in GET client:", error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin access required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch client' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
