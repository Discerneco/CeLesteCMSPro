import { hash, verify } from '@oslojs/crypto/sha256';
import { generateRandomString } from '@oslojs/crypto/random';
import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { Cookie } from '@oslojs/cookie';
import { getDB } from './db';
import { sessions, users } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

// Password hashing with Oslo
export async function hashPassword(password: string): Promise<string> {
  const salt = generateRandomString(16);
  const hashedPassword = await hash(new TextEncoder().encode(password + salt));
  return encodeBase64(hashedPassword) + ':' + salt;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [encodedHash, salt] = hashedPassword.split(':');
  const hashBytes = decodeBase64(encodedHash);
  const inputHash = await hash(new TextEncoder().encode(password + salt));
  return encodeBase64(inputHash) === encodedHash;
}

// Session management
export function generateSessionId(): string {
  return generateRandomString(32);
}

export async function createSession(userId: string, platform?: App.Platform): Promise<string> {
  const db = getDB(platform);
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string, platform?: App.Platform): Promise<{ user: any; session: any } | null> {
  const db = getDB(platform);
  
  const result = await db
    .select({
      user: users,
      session: sessions
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        // Check if session hasn't expired
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  const { user, session } = result[0];
  
  // Extend session if it expires within 1 day
  if (session.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiresAt })
      .where(eq(sessions.id, sessionId));
    session.expiresAt = newExpiresAt;
  }
  
  return { user, session };
}

export async function deleteSession(sessionId: string, platform?: App.Platform): Promise<void> {
  const db = getDB(platform);
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Cookie utilities
export function createSessionCookie(sessionId: string): Cookie {
  return new Cookie('session', sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export function deleteSessionCookie(): Cookie {
  return new Cookie('session', '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });
}