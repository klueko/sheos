import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/db';
import { users, userSessions, userKeys } from '$lib/db/schema';

// Create Drizzle adapter for SQLite (better-sqlite3)
// Pass session and user tables (keys are managed separately)
const adapter = new DrizzleSQLiteAdapter(db, userSessions, users);

// Create Lucia instance
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      phone: attributes.phone,
      role: attributes.role,
      isActive: attributes.isActive
    };
  }
});

// Extend Lucia types
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      role: string;
      isActive: boolean;
    };
  }
}
