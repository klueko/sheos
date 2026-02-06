import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, normalize } from 'node:path';

// Optional: pnpm add mime-types
// import { lookup as mimeLookup } from 'mime-types';

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const rel = params.path || '';
  const safeRel = normalize(rel).replace(/^(\.\.[/\\])+/, ''); // anti-path traversal
  const filePath = join(process.cwd(), 'data', 'uploads', safeRel);

  if (!existsSync(filePath)) throw error(404, 'Fichier introuvable');

  const buf = await readFile(filePath);
  
  // Simple MIME type detection based on extension
  const ext = filePath.split('.').pop()?.toLowerCase();
  let mime = 'application/octet-stream';
  if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
  else if (ext === 'png') mime = 'image/png';
  else if (ext === 'gif') mime = 'image/gif';
  else if (ext === 'webp') mime = 'image/webp';
  else if (ext === 'svg') mime = 'image/svg+xml';

  setHeaders({
    'content-type': mime,
    'cache-control': 'public, max-age=31536000, immutable'
  });

  return new Response(buf);
};
