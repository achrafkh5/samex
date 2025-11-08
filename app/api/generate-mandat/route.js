import { NextResponse } from 'next/server';
import TransitaireModel from '@/app/models/Transitaire';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to draw text at given coordinates
const drawText = (page, text, coords, font, size = 10, color = rgb(0, 0, 0)) => {
  page.drawText(text, {
    x: coords.x,
    y: coords.y,
    font,
    size,
    color,
  });
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { transitaireId, num_agrement, nom_ou_raison_sociale, nif, wilaya, represente_par } = body;

    let transitaire;

    // If transitaireId is provided, fetch from database
    if (transitaireId) {
      transitaire = await TransitaireModel.findById(transitaireId);
      if (!transitaire) {
        return NextResponse.json({ error: 'Transitaire not found' }, { status: 404 });
      }
    }
    // Otherwise, use the provided fields directly
    else if (num_agrement && nom_ou_raison_sociale && nif && wilaya) {
      transitaire = {
        num_agrement,
        nom_ou_raison_sociale,
        nif,
        wilaya,
        represente_par: represente_par || '',
      };
    }
    // If neither format is provided, return error
    else {
      return NextResponse.json({ 
        error: 'Either transitaireId or all fields (num_agrement, nom_ou_raison_sociale, nif, wilaya) are required' 
      }, { status: 400 });
    }

    // Load PDF template
    const templatePath = path.join(
      process.cwd(),
      'public',
      'MANDAT SARL CHRONOS TRANSIT & LOGISTIQUE (2).pdf (1).pdf'
    );
    const existingPdfBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // Coordinate map for PDF fields
    const coords = {
      num_agrement: { x: 135, y: height - 587 },
      nom_ou_raison_sociale: { x: 200, y: height - 605 },
      represente_par: { x: 130, y: height - 627 },
      nif: { x: 260, y: height - 584 },
    };

    // Draw fields
    drawText(firstPage, transitaire.num_agrement, coords.num_agrement, font, fontSize);
    drawText(firstPage, transitaire.nom_ou_raison_sociale, coords.nom_ou_raison_sociale, font, fontSize);
    if (transitaire.represente_par) {
      drawText(firstPage, transitaire.represente_par, coords.represente_par, font, fontSize);
    }
    drawText(firstPage, transitaire.nif, coords.nif, font, fontSize);

    // Save modified PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'mandats',
          public_id: `mandat_${transitaire.nom_ou_raison_sociale.replace(/\s+/g, '_').replace(/&/g, 'ET')}_${Date.now()}`,
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ PDF uploaded to Cloudinary:', result.public_id);
            resolve(
              NextResponse.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id, // Include public_id in response
                transitaire: {
                  num_agrement: transitaire.num_agrement,
                  nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
                  represente_par: transitaire.represente_par,
                  nif: transitaire.nif,
                  wilaya: transitaire.wilaya,
                },
              })
            );
          }
        }
      );

      uploadStream.end(Buffer.from(pdfBytes));
    });
  } catch (error) {
    console.error('Error generating mandat:', error);
    return NextResponse.json({ error: 'Failed to generate mandat: ' + error.message }, { status: 500 });
  }
}
