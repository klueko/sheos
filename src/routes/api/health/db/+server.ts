import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { testConnection } from '$lib/db';

export const GET: RequestHandler = async () => {
  const ok = await testConnection();
  return json({ ok });
};



