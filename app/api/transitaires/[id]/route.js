import { NextResponse } from 'next/server';
import TransitaireModel from '@/app/models/Transitaire';
import { verifyAdmin } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET transitaire by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const transitaire = await TransitaireModel.findById(id);

    if (!transitaire) {
      return NextResponse.json(
        { error: 'Transitaire not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transitaire);
  } catch (error) {
    console.error('Error fetching transitaire:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transitaire' },
      { status: 500 }
    );
  }
}

// PUT update transitaire (Admin only)
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const { id } = await params;
    const body = await request.json();
    const { num_agrement, nom_ou_raison_sociale, nif, wilaya, represente_par, pdfUrl: providedPdfUrl } = body;

    // Validate required fields
    if (!num_agrement || !nom_ou_raison_sociale || !nif || !wilaya) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if num_agrement exists for another transitaire
    const existing = await TransitaireModel.findByNumAgrement(num_agrement);
    if (existing && existing._id.toString() !== id) {
      return NextResponse.json(
        { error: 'Agreement number already exists' },
        { status: 409 }
      );
    }

    const updateData = {
      num_agrement,
      nom_ou_raison_sociale,
      nif,
      wilaya,
      represente_par: represente_par || '',
    };

    // If pdfUrl is provided in the request, use it (for manual updates from frontend)
    if (providedPdfUrl) {
      updateData.pdfUrl = providedPdfUrl;
    } else {
      // Otherwise, regenerate PDF with new data and upload to Cloudinary
      let cloudinaryPublicId = null;
      try {
        const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-mandat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            num_agrement,
            nom_ou_raison_sociale,
            nif,
            wilaya,
            represente_par,
          }),
        });

        if (pdfResponse.ok) {
          const pdfData = await pdfResponse.json();
          updateData.pdfUrl = pdfData.url;
          updateData.cloudinaryPublicId = pdfData.publicId;
          console.log('✅ PDF regenerated with public_id:', pdfData.publicId);
        } else {
          console.warn('Failed to regenerate PDF during transitaire update');
        }
      } catch (pdfError) {
        console.error('Error regenerating PDF:', pdfError);
        // Continue without PDF update
      }
    }

    const transitaire = await TransitaireModel.update(id, updateData);

    if (!transitaire) {
      return NextResponse.json(
        { error: 'Transitaire not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transitaire);
  } catch (error) {
    console.error('Error updating transitaire:', error);
    return NextResponse.json(
      { error: 'Failed to update transitaire' },
      { status: 500 }
    );
  }
}

// DELETE transitaire (Admin only)
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const { id } = await params;
    
    // First, get the transitaire to find the PDF URL
    const transitaire = await TransitaireModel.findById(id);
    
    if (!transitaire) {
      return NextResponse.json(
        { error: 'Transitaire not found' },
        { status: 404 }
      );
    }

    // Delete PDF from Cloudinary if it exists
    if (transitaire.cloudinaryPublicId) {
      try {
        console.log('🗑️ Attempting to delete PDF from Cloudinary:', transitaire.cloudinaryPublicId);

        // Delete from Cloudinary using stored public_id
        const result = await cloudinary.uploader.destroy(transitaire.cloudinaryPublicId, { 
          resource_type: 'raw',
          invalidate: true
        });

        console.log('✅ Cloudinary deletion result:', result);

        if (result.result === 'ok') {
          console.log(`✅ Successfully deleted PDF from Cloudinary: ${transitaire.cloudinaryPublicId}`);
        } else if (result.result === 'not found') {
          console.log(`⚠️ PDF not found in Cloudinary (may have been deleted already): ${transitaire.cloudinaryPublicId}`);
        }
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete PDF from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary deletion fails
      }
    } else if (transitaire.pdfUrl) {
      // Fallback: try to extract public_id from URL if cloudinaryPublicId is not stored
      try {
        const urlParts = transitaire.pdfUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex !== -1) {
          let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          const hasVersion = /^v\d+\//.test(pathAfterUpload);
          if (hasVersion) {
            pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
          }
          const publicId = pathAfterUpload.replace('.pdf', '');

          console.log('🗑️ Attempting to delete PDF from Cloudinary (extracted):', publicId);

          const result = await cloudinary.uploader.destroy(publicId, { 
            resource_type: 'raw',
            invalidate: true
          });

          console.log('✅ Cloudinary deletion result:', result);
        }
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete PDF from Cloudinary:', cloudinaryError);
      }
    }

    // Delete from database
    const success = await TransitaireModel.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete transitaire from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transitaire:', error);
    return NextResponse.json(
      { error: 'Failed to delete transitaire' },
      { status: 500 }
    );
  }
}
