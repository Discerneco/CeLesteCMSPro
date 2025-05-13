import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDB } from './db';

/**
 * Better Auth integration for CeLesteCMS Pro
 * Uses Argon2id password hashing and JWT sessions
 * Integrates with Drizzle ORM and Cloudflare D1
 */

// Type to maintain compatibility with the old auth system during transition
export type TokenData = {
  userId: string;
  role: string;
};

/**
 * Create and configure the Better Auth instance
 * @param platform The Cloudflare platform object containing env and D1 bindings
 */
export function createAuth(platform: App.Platform | null | undefined) {
  if (!platform) {
    throw new Error('Platform is required for authentication');
  }
  
  // Get the database instance
  const db = getDB(platform);
  
  // Create and return the Better Auth instance
  return betterAuth({
    // Connect to Drizzle ORM with Cloudflare D1
    database: drizzleAdapter(db, { 
      provider: "sqlite", // For Cloudflare D1
      // If your schema tables use plural form (e.g., users instead of user)
      usePlural: true,
    }),
    
    // Configure email/password authentication
    emailAndPassword: {
      enabled: true,
      // Secure password policy
      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
      // Argon2id configuration optimized for Cloudflare Workers
      argon2: {
        memoryCost: 32768, // 32MB (lower than default for Workers)
        timeCost: 2,
        parallelism: 1,
        hashLength: 32,
      }
    },
    
    // JWT session configuration
    session: {
      strategy: "jwt",
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days for refresh tokens
    },
    
    // Secret for JWT signing
    secret: env.AUTH_SECRET || env.JWT_SECRET || "dev-secret-change-me-in-production",
    
    // Trusted origins for CSRF protection
    trustedOrigins: [
      "https://celestecms-pro.pages.dev",
      "http://localhost:5173"
    ],
  });
}

/**
 * Compatibility functions to maintain backward compatibility 
 * with existing code during the transition to Better Auth
 */

// Compatibility: Hash a password (not needed with Better Auth but kept for compatibility)
export async function hashPassword(password: string): Promise<string> {
  console.warn('Using deprecated hashPassword function. Better Auth handles password hashing automatically.');
  const salt = env.PASSWORD_SALT || 'dev-salt';
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + salt))
    .then(hash => btoa(String.fromCharCode(...new Uint8Array(hash))));
}

// Compatibility: Verify a password (not needed with Better Auth but kept for compatibility)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  console.warn('Using deprecated verifyPassword function. Better Auth handles password verification automatically.');
  
  // TEMPORARY: Allow plaintext password for testing
  if (hash === 'plaintext-password-for-testing') {
    if (password === 'testing123' || password === 'CeLeste2025!') {
      return true;
    }
  }
  
  // Normal password verification
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// Compatibility: Create a JWT token (replaced by Better Auth sessions)
export async function createToken(userId: string, role: string): Promise<string> {
  console.warn('Using deprecated createToken function. Better Auth handles JWT tokens automatically.');
  // This is used only for backward compatibility during transition
  return `deprecated-token-${userId}-${role}-${Date.now()}`;
}

// Compatibility: Verify a JWT token (replaced by Better Auth sessions)
export async function verifyToken(token: string): Promise<TokenData | null> {
  console.warn('Using deprecated verifyToken function. Better Auth handles token verification automatically.');
  // This is used only for backward compatibility during transition
  if (token && token.startsWith('deprecated-token-')) {
    const parts = token.split('-');
    if (parts.length >= 4) {
      return {
        userId: parts[2],
        role: parts[3]
      };
    }
  }
  return null;
}
