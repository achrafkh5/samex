import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendContactNotification({ fullName, email, phone, subject, message }) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.warn('⚠️  Resend API key not configured. Email notification skipped.');
      console.log('💡 Add RESEND_API_KEY to .env.local to enable email notifications');
      return { success: true, skipped: true, reason: 'Resend API key not configured' };
    }
    
    // In testing mode, Resend only allows sending to your verified email
    // Make sure BUSINESS_EMAIL is set to your verified email: am.khoualdi@ensta.edu.dz
    const businessEmail = process.env.BUSINESS_EMAIL || 'am.khoualdi@ensta.edu.dz';
    
    const { data, error } = await resend.emails.send({
      from: 'ALKO Cars <onboarding@resend.dev>', // Replace with your verified domain later
      to: [businessEmail],
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
              .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
              .value { color: #333; }
              .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e0e0e0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚗 New Contact Form Submission</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">ALKO Cars - Dream Cars</p>
              </div>
              
              <div class="content">
                <div class="info-row">
                  <div class="label">👤 Full Name</div>
                  <div class="value">${fullName}</div>
                </div>
                
                <div class="info-row">
                  <div class="label">📧 Email</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                
                <div class="info-row">
                  <div class="label">📱 Phone</div>
                  <div class="value"><a href="tel:${phone}">${phone}</a></div>
                </div>
                
                <div class="info-row">
                  <div class="label">📋 Subject</div>
                  <div class="value">${subject}</div>
                </div>
                
                <div class="message-box">
                  <div class="label">💬 Message</div>
                  <div class="value" style="white-space: pre-wrap;">${message}</div>
                </div>
                
                <div class="footer">
                  <p>This email was sent from your ALKO Cars website contact form.</p>
                  <p>You can reply directly to this email to respond to ${fullName}.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend notification error:', error);
      console.log('💡 Make sure BUSINESS_EMAIL in .env.local is: am.khoualdi@ensta.edu.dz');
      return { success: false, error };
    }

    console.log('✅ Email notification sent successfully to:', businessEmail);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendContactConfirmation({ fullName, email }) {
  // Check if Resend is configured
  if (!resend) {
    console.warn('⚠️  Resend API key not configured. Confirmation email skipped.');
    return { success: true, skipped: true, reason: 'Resend API key not configured' };
  }
  
  // Skip sending confirmation to customer in development/testing
  // Only send if the customer email matches your verified email
  const verifiedEmail = process.env.BUSINESS_EMAIL;
  
  // Only send if customer email is the same as your verified email (for testing)
  if (email !== verifiedEmail) {
    console.log('⏭️  Skipping customer confirmation email (testing mode)');
    console.log(`   Customer: ${email}`);
    console.log(`💡 To enable customer confirmations, verify your domain at resend.com/domains`);
    return { success: true, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ALKO Cars <onboarding@resend.dev>', // Replace with your verified domain later
      to: [email],
      subject: 'Thank you for contacting ALKO Cars',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✅ Message Received!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">ALKO Cars - Dream Cars</p>
              </div>
              
              <div class="content">
                <div class="message">
                  <h2 style="color: #667eea; margin-top: 0;">Hello ${fullName},</h2>
                  <p>Thank you for reaching out to ALKO Cars! We have received your message and our team will get back to you as soon as possible.</p>
                  <p>We typically respond within 24 hours during business days.</p>
                  <p style="margin-top: 30px;">Best regards,<br><strong>ALKO Cars Team</strong></p>
                </div>
                
                <div class="footer">
                  <p>This is an automated confirmation email.</p>
                  <p>Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Confirmation email error:', error);
    return { success: false, error: error.message };
  }
}
