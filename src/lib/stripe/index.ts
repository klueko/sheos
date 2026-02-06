import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
}) : null;

// Check if we're in test mode
export const isStripeConfigured = !!STRIPE_SECRET_KEY;
export const isTestMode = !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.startsWith('sk_test_');

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'eur',
  payment_method_types: ['card'],
  mode: 'payment' as const,
};

// Helper function to format amount for Stripe (convert to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper function to format amount from Stripe (convert from cents)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
