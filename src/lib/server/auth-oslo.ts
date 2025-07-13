/**
 * Official Oslo + Arctic Authentication Implementation
 * Following Oslo.js best practices for SvelteKit
 * 
 * Using:
 * - @oslojs/crypto for password hashing (SHA-256)
 * - @oslojs/encoding for base64 encoding
 * - Native SvelteKit cookies (since @oslojs/cookie doesn't exist)
 * - Arctic for OAuth (future use)
 */

import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64, decodeBase64 } from '@oslojs/encoding';
import { createDb } from './db';
import { sessions, users } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

// Generate cryptographically secure random bytes
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Generate random string for salts and session IDs
function generateRandomString(length: number): string {
  const bytes = generateRandomBytes(length);
  return encodeBase64(bytes).slice(0, length);
}

/**
 * Hash password using Oslo's SHA-256 with salt
 * Official Oslo approach: use sha256 with proper salting
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateRandomString(16);
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + salt);
  const hashBytes = await sha256(passwordBytes);
  const hashB64 = encodeBase64(hashBytes);
  return `${hashB64}:${salt}`;
}

/**
 * Verify password using Oslo's SHA-256
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [hashB64, salt] = hashedPassword.split(':');
    if (!hashB64 || !salt) return false;
    
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password + salt);
    const computedHashBytes = await sha256(passwordBytes);
    const computedHashB64 = encodeBase64(computedHashBytes);
    
    return hashB64 === computedHashB64;
  } catch {
    return false;
  }
}

/**
 * Generate session ID using cryptographically secure random
 */
export function generateSessionId(): string {
  return generateRandomString(32);
}

/**
 * Create session in database
 * Using existing schema for compatibility
 */
export async function createSession(userId: string, platform?: App.Platform): Promise<string> {
  const db = createDb(platform);
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    token: sessionId, // For compatibility with existing schema
    expiresAt,
    createdAt: new Date(),
    userAgent: '', // Optional
    ipAddress: '' // Optional
  });
  
  return sessionId;
}

/**
 * Validate session and extend if needed
 */
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
        eq(sessions.token, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
    
  if (result.length === 0) {
    return null;
  }
  
  const { user, session } = result[0];
  
  // Extend session if it expires within 1 day (Oslo best practice)
  if (session.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiresAt })
      .where(eq(sessions.token, sessionId));
    session.expiresAt = newExpiresAt;
  }
  
  return { user, session };
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string, platform?: App.Platform): Promise<void> {
  const db = createDb(platform);
  await db.delete(sessions).where(eq(sessions.token, sessionId));
}

/**
 * Cookie utilities using SvelteKit's native cookies
 * (since @oslojs/cookie doesn't exist in the current Oslo project)
 */
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