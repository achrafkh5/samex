import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    // Read the PDF template from public folder
    const templatePath = path.join(process.cwd(), 'public', 'MANDAT SARL CHRONOS TRANSIT & LOGISTIQUE (2).pdf (1).pdf');
    const existingPdfBytes = await fs.readFile(templatePath);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    
    // Get all form fields
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    return NextResponse.json({
      success: true,
      totalFields: fields.length,
      fields: fieldInfo,
      message: 'If no fields found, the PDF might not have fillable form fields. We can add text at specific coordinates instead.'
    });
  } catch (error) {
    console.error('Error inspecting PDF:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
