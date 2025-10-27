import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    console.log("🗑️ Delete image request received");
    
    const { url } = await req.json();

    if (!url) {
      console.error("❌ No URL provided");
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    console.log("🔍 URL to delete:", url);

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      console.error("❌ Invalid Cloudinary URL format");
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // Get everything after 'upload/v{version}/' and remove file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];

    console.log("🆔 Extracted public_id:", publicId);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true
    });

    console.log("✅ Cloudinary delete result:", result);

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json({ 
        success: true, 
        message: 'Image deleted successfully',
        result: result.result 
      });
    } else {
      throw new Error('Failed to delete image from Cloudinary');
    }

  } catch (error) {
    console.error("❌ Error deleting image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}
