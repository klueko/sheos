import nodemailer from 'nodemailer';

// Configuration email - utilisez vos propres paramètres SMTP
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    });
    return transporter;
  } catch (error) {
    console.error('Erreur création transporter:', error);
    return null;
  }
}

export interface EmailData {
  to: string;
  subject: string;
  order: {
    id: number;
    orderNumber: string;
    status: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    createdAt: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
      images?: string[];
    };
    variant: {
      size: string;
      color: string;
    };
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

export async function sendOrderConfirmationEmail(emailData: EmailData): Promise<boolean> {
  const emailTransporter = getTransporter();
  
  // Vérifier si la configuration SMTP est disponible
  if (!emailTransporter) {
    console.log('📧 Configuration SMTP manquante - Email simulé');
    console.log('📧 Email data:', emailData);
    return true; // Retourner true pour simuler l'envoi
  }

  try {
    // Template HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de commande</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border: 1px solid #e5e7eb;
          }
          .order-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-table th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .total-section {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .address-section {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background-color: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Merci pour votre commande !</h1>
          <p>Votre commande a été confirmée</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${emailData.user.firstName} ${emailData.user.lastName}</strong>,</p>
          
          <p>Nous vous remercions pour votre commande ! Votre paiement a été traité avec succès.</p>
          
          <div class="order-details">
            <h2>📋 Détails de votre commande</h2>
            <p><strong>Numéro de commande :</strong> ${emailData.order.orderNumber}</p>
            <p><strong>Date :</strong> ${new Date(emailData.order.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Statut :</strong> <span class="status-badge">${emailData.order.status}</span></p>
          </div>
          
          <h3>🛍️ Articles commandés</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Taille</th>
                <th>Couleur</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${emailData.items.map(item => `
                <tr>
                  <td><strong>${item.product.name}</strong></td>
                  <td>${item.variant.size}</td>
                  <td>${item.variant.color}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price)}</td>
                  <td><strong>${formatPrice(item.price * item.quantity)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <h3>💰 Résumé financier</h3>
            <p><strong>Sous-total :</strong> ${formatPrice(emailData.order.subtotal)}</p>
            ${emailData.order.shipping > 0 ? `<p><strong>Livraison :</strong> ${formatPrice(emailData.order.shipping)}</p>` : '<p><strong>Livraison :</strong> Gratuite</p>'}
            <p><strong>TVA :</strong> Incluse dans le prix</p>
            <hr>
            <p><strong>Total :</strong> <strong style="font-size: 18px;">${formatPrice(emailData.order.total)}</strong></p>
          </div>
          
          <div class="address-section">
            <h3>🚚 Adresse de livraison</h3>
            <p>
              <strong>${emailData.shippingAddress.firstName} ${emailData.shippingAddress.lastName}</strong><br>
              ${emailData.shippingAddress.address1}<br>
              ${emailData.shippingAddress.address2 ? emailData.shippingAddress.address2 + '<br>' : ''}
              ${emailData.shippingAddress.postalCode} ${emailData.shippingAddress.city}<br>
              ${emailData.shippingAddress.country}
            </p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📦 Prochaines étapes</h3>
            <ul>
              <li>Votre commande sera préparée dans les 1-2 jours ouvrés</li>
              <li>Vous recevrez un email avec le numéro de suivi</li>
              <li>Livraison sous 2-5 jours ouvrés</li>
            </ul>
          </div>
          
          <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
          
          <p>Merci encore pour votre confiance !</p>
        </div>
        
        <div class="footer">
          <p><strong>Sheos</strong> - Votre boutique de chaussures en ligne</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </body>
      </html>
    `;

    // Version texte de l'email
    const textContent = `
Merci pour votre commande !

Bonjour ${emailData.user.firstName} ${emailData.user.lastName},

Nous vous remercions pour votre commande ! Votre paiement a été traité avec succès.

DÉTAILS DE VOTRE COMMANDE
Numéro de commande : ${emailData.order.orderNumber}
Date : ${new Date(emailData.order.createdAt).toLocaleDateString('fr-FR')}
Statut : ${emailData.order.status}

ARTICLES COMMANDÉS
${emailData.items.map(item => `
- ${item.product.name} (Taille ${item.variant.size}, ${item.variant.color})
  Quantité: ${item.quantity}
  Prix: ${formatPrice(item.price * item.quantity)}
`).join('')}

RÉSUMÉ FINANCIER
Sous-total : ${formatPrice(emailData.order.subtotal)}
Livraison : ${emailData.order.shipping > 0 ? formatPrice(emailData.order.shipping) : 'Gratuite'}
TVA : Incluse dans le prix
Total : ${formatPrice(emailData.order.total)}

ADRESSE DE LIVRAISON
${emailData.shippingAddress.firstName} ${emailData.shippingAddress.lastName}
${emailData.shippingAddress.address1}
${emailData.shippingAddress.address2 ? emailData.shippingAddress.address2 : ''}
${emailData.shippingAddress.postalCode} ${emailData.shippingAddress.city}
${emailData.shippingAddress.country}

PROCHAINES ÉTAPES
- Votre commande sera préparée dans les 1-2 jours ouvrés
- Vous recevrez un email avec le numéro de suivi
- Livraison sous 2-5 jours ouvrés

Merci encore pour votre confiance !

Sheos - Votre boutique de chaussures en ligne
    `;

    // Envoi de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@sheos.com',
      to: emailData.to,
      subject: emailData.subject,
      text: textContent,
      html: htmlContent
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

// Fonction utilitaire pour formater les prix
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}
