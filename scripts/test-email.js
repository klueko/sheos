// Script simple pour tester l'envoi d'email
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('📧 Testing email configuration...');

// Vérifier la configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

console.log('📧 SMTP Configuration:');
console.log('- Host:', smtpConfig.host);
console.log('- Port:', smtpConfig.port);
console.log('- User:', smtpConfig.auth.user);
console.log('- Pass:', smtpConfig.auth.pass ? '***configured***' : 'NOT SET');
console.log('- From:', process.env.SMTP_FROM);

if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.log('❌ Email configuration incomplete!');
  console.log('📝 Please create a .env file with:');
  console.log('SMTP_HOST=smtp.gmail.com');
  console.log('SMTP_PORT=587');
  console.log('SMTP_USER=your.email@gmail.com');
  console.log('SMTP_PASS=your_app_password');
  console.log('SMTP_FROM=your.email@gmail.com');
  process.exit(1);
}

// Créer le transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Tester la connexion
console.log('📧 Testing SMTP connection...');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ SMTP connection successful!');
    
    // Envoyer un email de test
    const testEmail = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Envoyer à soi-même
      subject: 'Test Email - Sheos Configuration',
      text: 'This is a test email to verify your SMTP configuration is working correctly.',
      html: `
        <h1>Test Email - Sheos</h1>
        <p>This is a test email to verify your SMTP configuration is working correctly.</p>
        <p>If you receive this email, your configuration is successful!</p>
      `
    };

    console.log('📧 Sending test email...');
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.log('❌ Failed to send test email:', error.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
      }
      process.exit(0);
    });
  }
});
