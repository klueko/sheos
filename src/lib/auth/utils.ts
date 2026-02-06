import { lucia } from './lucia';
import { db } from '$lib/db';
import { users, userKeys } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';

export async function hashPassword(password: string): Promise<string> {
  return await new Argon2id().hash(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await new Argon2id().verify(hashedPassword, password);
}

export async function createUser(email: string, password: string, userData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}) {
  const userId = generateId(15);
  const hashedPassword = await hashPassword(password);

  // Insert user
  await db.insert(users).values({
    id: userId,
    email,
    firstName: userData.firstName || null,
    lastName: userData.lastName || null,
    phone: userData.phone || null,
    role: userData.role || 'CUSTOMER',
    isActive: true
  });

  // Insert user key for password
  await db.insert(userKeys).values({
    id: `email:${email}`,
    userId,
    hashedPassword
  });

  return userId;
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function validateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const userKey = await db.select().from(userKeys).where(eq(userKeys.userId, user.id)).limit(1);
  if (!userKey[0]?.hashedPassword) {
    return null;
  }

  const validPassword = await verifyPassword(password, userKey[0].hashedPassword);
  if (!validPassword) {
    return null;
  }

  return user;
}
