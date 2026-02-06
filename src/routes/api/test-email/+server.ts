import { json } from '@sveltejs/kit';
import { sendOrderConfirmationEmail } from '$lib/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  console.log('📧 Test email API called');
  
  try {
    const { email } = await request.json();
    console.log('📧 Test email request:', { email });

    // Use provided email or fall back to authenticated user's email
    let targetEmail = email;
    
    if (!targetEmail && locals.user) {
      // If no email provided but user is authenticated, use their email
      targetEmail = locals.user.email;
      console.log('📧 Using authenticated user email:', targetEmail);
    }

    if (!targetEmail) {
      console.log('❌ No email provided and no authenticated user');
      return json({ error: 'Email address is required or user must be authenticated' }, { status: 400 });
    }

    // Create test email data
    const testEmailData = {
      to: targetEmail,
      subject: 'Test - Confirmation de commande - CMD-TEST123',
      order: {
        id: 999,
        orderNumber: 'CMD-TEST123',
        status: 'PAID',
        subtotal: 120.00,
        tax: 0,
        shipping: 0,
        total: 120.00,
        currency: 'EUR',
        createdAt: new Date().toISOString()
      },
      items: [
        {
          quantity: 1,
          price: 120.00,
          product: {
            name: 'Nike Air Max Test',
            images: []
          },
          variant: {
            size: '42',
            color: 'Noir'
          }
        }
      ],
      shippingAddress: {
        firstName: 'Jean',
        lastName: 'Dupont',
        address1: '123 rue de la Paix',
        address2: 'Appartement 4B',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      user: {
        firstName: 'Jean',
        lastName: 'Dupont'
      }
    };

    // Send test email
    console.log('📧 Attempting to send test email...');
    const emailSent = await sendOrderConfirmationEmail(testEmailData);
    console.log('📧 Email send result:', emailSent);

    if (emailSent) {
      console.log('✅ Test email sent successfully');
      return json({
        success: true,
        message: `Test email sent successfully to ${targetEmail}`,
        emailData: testEmailData
      });
    } else {
      console.log('❌ Test email failed to send');
      return json({
        success: false,
        message: `Failed to send test email to ${targetEmail}`,
        error: 'Email service configuration issue'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};
