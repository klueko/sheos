import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // Check environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    // Determine overall status
    const hasBasicConfig = smtpHost && smtpPort && smtpUser && smtpPass;
    const overallStatus = hasBasicConfig 
      ? 'Email configuration is complete - emails should be sent'
      : 'Email configuration is incomplete - emails will be simulated';

    // Check if we're in simulation mode
    const isSimulationMode = !hasBasicConfig;

    return json({
      smtpHost: smtpHost || null,
      smtpPort: smtpPort || null,
      smtpUser: smtpUser || null,
      smtpPass: smtpPass ? 'Configured' : null,
      smtpFrom: smtpFrom || null,
      overallStatus,
      isSimulationMode,
      recentEmails: [] // Could be expanded to show recent email attempts
    });

  } catch (error) {
    console.error('Email diagnostics error:', error);
    return json({
      error: 'Failed to load email diagnostics',
      smtpHost: null,
      smtpPort: null,
      smtpUser: null,
      smtpPass: null,
      smtpFrom: null,
      overallStatus: 'Error loading diagnostics',
      isSimulationMode: true
    }, { status: 500 });
  }
};
