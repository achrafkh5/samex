import { NextResponse } from 'next/server';
import TransitaireModel from '@/app/models/Transitaire';
import { verifyAdmin } from '@/lib/auth';

// GET all transitaires
export async function GET(request) {
  try {
    const transitaires = await TransitaireModel.findAll();
    return NextResponse.json(transitaires);
  } catch (error) {
    console.error('Error fetching transitaires:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transitaires' },
      { status: 500 }
    );
  }
}

// POST new transitaire (Admin only)
export async function POST(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const body = await request.json();
    const { num_agrement, nom_ou_raison_sociale, nif, wilaya, represente_par } = body;

    // Validate required fields
    if (!num_agrement || !nom_ou_raison_sociale || !nif || !wilaya) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if num_agrement already exists
    const exists = await TransitaireModel.numAgrementExists(num_agrement);
    if (exists) {
      return NextResponse.json(
        { error: 'Agreement number already exists' },
        { status: 409 }
      );
    }

    // Generate PDF and upload to Cloudinary
    let pdfUrl = null;
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
        pdfUrl = pdfData.url;
        cloudinaryPublicId = pdfData.publicId;
        console.log('✅ PDF generated with public_id:', cloudinaryPublicId);
      } else {
        console.warn('Failed to generate PDF during transitaire creation');
      }
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue without PDF - it can be regenerated later
    }

    const transitaire = await TransitaireModel.create({
      num_agrement,
      nom_ou_raison_sociale,
      nif,
      wilaya,
      represente_par,
      pdfUrl,
      cloudinaryPublicId,
    });

    return NextResponse.json(transitaire, { status: 201 });
  } catch (error) {
    console.error('Error creating transitaire:', error);
    return NextResponse.json(
      { error: 'Failed to create transitaire' },
      { status: 500 }
    );
  }
}
