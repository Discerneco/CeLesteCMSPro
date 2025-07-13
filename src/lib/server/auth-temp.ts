import crypto from 'crypto';
import { createDb } from './db';
import { sessions, users } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

// Temporary auth implementation using Node.js crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${hash}:${salt}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [hash, salt] = hashedPassword.split(':');
  const inputHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === inputHash;
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string, platform?: App.Platform): Promise<string> {
  const db = createDb(platform);
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token: sessionId, // Use sessionId as token for compatibility
    expiresAt,
    createdAt: new Date(),
    userAgent: '',
    ipAddress: ''
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string, platform?: App.Platform): Promise<{ user: any; session: any } | null> {
  const db = createDb(platform);
  
  const result = await db
    .select({
      user: users,
      session: sessions
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, sessionId), // Use token field for lookup
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  return result[0];
}

export async function deleteSession(sessionId: string, platform?: App.Platform): Promise<void> {
  const db = createDb(platform);
  await db.delete(sessions).where(eq(sessions.token, sessionId)); // Use token field
}

export function createSessionCookie(sessionId: string) {
  return {
    name: 'session',
    value: sessionId,
    attributes: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  };
}

export function deleteSessionCookie() {
  return {
    name: 'session',
    value: '',
    attributes: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0
    }
  };
}