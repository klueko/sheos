import { existsSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';

export async function saveUpload(file: File, subdir = 'products'): Promise<string> {
  const baseDir = './data/uploads';
  const dir = `${baseDir}/${subdir}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const ext = extname(file.name) || '.bin';
  const name = `${Date.now()}-${randomUUID()}${ext}`;
  const full = `${dir}/${name}`;

  const buf = Buffer.from(await file.arrayBuffer());
  
  // Optional: Add file size and type validation here
  if (buf.length > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File too large (max 5MB)');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  await writeFile(full, buf);

  // Public URL served by the upload route
  return `/uploads/${subdir}/${name}`;
}
