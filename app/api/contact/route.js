import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendContactNotification, sendContactConfirmation } from '@/lib/resend';
import { verifyAdmin } from '@/lib/auth';

// GET - Fetch all contact submissions (for admin)
export async function GET(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const client = await clientPromise;
    const db = client.db('dreamcars');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;

    const contacts = await db
      .collection('contacts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST - Submit contact form
export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, subject, message } = body;

    // Validation
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Full name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dreamcars');

    // Save to database
    const contactSubmission = {
      fullName,
      email,
      phone: phone || '',
      subject: subject || 'generalInquiry',
      message,
      status: 'new', // new, read, replied
      createdAt: new Date(),
    };

    const result = await db.collection('contacts').insertOne(contactSubmission);

    // Send email notification to business
    const notificationResult = await sendContactNotification({
      fullName,
      email,
      phone: phone || 'Not provided',
      subject: subject || 'General Inquiry',
      message,
    });

    // Send confirmation email to customer (only if domain verified)
    const confirmationResult = await sendContactConfirmation({ fullName, email });

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: result.insertedId,
      emailSent: notificationResult.success,
      confirmationSent: confirmationResult.skipped ? false : confirmationResult.success,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

// PATCH - Update contact status (for admin)
export async function PATCH(request) {
  try {
    // Verify admin authentication
    await verifyAdmin();

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dreamcars');
    const { ObjectId } = require('mongodb');

    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact status updated',
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.message.includes("authenticated") || error.message.includes("token")) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
