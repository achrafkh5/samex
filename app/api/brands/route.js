import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const brands = await db.collection("brands").find({}).toArray();
    
    // Get price range and car count for each brand from cars collection
    const brandsWithData = await Promise.all(
      brands.map(async (brand) => {
        // Get car count for this brand
        const carCount = await db.collection("cars").countDocuments({ brand: brand.name });
        
        // Get price range for this brand
        const carsPriceData = await db.collection("cars")
          .aggregate([
            { $match: { brand: brand.name } },
            {
              $group: {
                _id: null,
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" }
              }
            }
          ])
          .toArray();
        
        return {
          ...brand,
          carCount: carCount,
          minPrice: carsPriceData[0]?.minPrice || 0,
          maxPrice: carsPriceData[0]?.maxPrice || 0
        };
      })
    );
    
    return NextResponse.json(brandsWithData);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const data = await request.json();

    const result = await db.collection("brands").insertOne(data);
    const insertedBrand = await db.collection("brands").findOne({ _id: result.insertedId });

    return NextResponse.json(insertedBrand, { status: 201 });
  } catch (error) {
    console.error("Error adding brand:", error);
    return NextResponse.json({ error: "Failed to add brand" }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }
    
    // Get the brand to find its name
    const brand = await db.collection("brands").findOne({ _id: new ObjectId(id) });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    // Find all cars with this brand
    const cars = await db.collection("cars").find({ brand: brand.name }).toArray();
    
    // Delete all car images from Cloudinary
    for (const car of cars) {
      // Delete main image
      if (car.image) {
        try {
          await fetch(`${request.headers.get('origin')}/api/upload/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: car.image }),
          });
          console.log(`✅ Deleted car main image: ${car.image}`);
        } catch (error) {
          console.error(`⚠️ Failed to delete car image: ${car.image}`, error);
        }
      }
      
      // Delete gallery images
      if (car.gallery && Array.isArray(car.gallery)) {
        for (const galleryImage of car.gallery) {
          try {
            await fetch(`${request.headers.get('origin')}/api/upload/delete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: galleryImage }),
            });
            console.log(`✅ Deleted car gallery image: ${galleryImage}`);
          } catch (error) {
            console.error(`⚠️ Failed to delete gallery image: ${galleryImage}`, error);
          }
        }
      }
    }
    
    // Delete all cars with this brand
    const carsDeleteResult = await db.collection("cars").deleteMany({ brand: brand.name });
    console.log(`✅ Deleted ${carsDeleteResult.deletedCount} cars for brand: ${brand.name}`);
    
    // Delete the brand itself
    const result = await db.collection("brands").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ 
      message: "Brand deleted successfully", 
      deletedCars: carsDeleteResult.deletedCount 
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("dreamcars");
    const { id, ...updateData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }
    const result = await db.collection("brands").updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return NextResponse.json({ message: "Brand updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}
