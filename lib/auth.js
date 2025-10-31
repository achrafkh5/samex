import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import clientPromise from "./mongodb";

export async function verifyAuth() {
  const cookieStore = await cookies(); // read cookies in Next.js
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("user not authenticated")
    throw new Error("Not authenticated");
  }

  try {
    
    const userId = jwt.verify(token, process.env.JWT_SECRET);
    return userId; // return user payload
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;

  if (!token) {
    console.log("Admin not authenticated");
    throw new Error("Not authenticated - Admin access required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify the admin exists in the database
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const admin = await db.collection("admins").findOne({ 
      email: decoded.email 
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    return { 
      id: admin._id.toString(), 
      email: admin.email,
      name: admin.name 
    };
  } catch (err) {
    console.error("Admin verification error:", err);
    throw new Error("Invalid admin token");
  }
}
