import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "./db"; // Your existing DB function
import { env } from "$env/dynamic/private";

// Create a function to initialize auth with the platform
export function createAuth(platform: App.Platform) {
  // Ensure platform is defined
  if (!platform) {
    throw new Error("Platform is not available");
  }
  
  const db = getDB(platform);
  
  return betterAuth({
    database: drizzleAdapter(db, { 
      provider: "sqlite", // For Cloudflare D1
    }),
    trustedOrigins: [
      // Update these with your actual URLs
      "https://celestecms-pro.pages.dev",
      "http://localhost:5173"
    ],
    // Email and password authentication
    emailAndPassword: {
      enabled: true,
      // Customize password policy
      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
      // Argon2id configuration (these are the defaults)
      argon2: {
        memoryCost: 65536, // 64MB
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
      }
    },
    // Session configuration
    session: {
      strategy: "jwt",
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days for refresh tokens
    },
    // Secret for JWT signing
    secret: env.AUTH_SECRET || "dev-secret-change-me-in-production",
  });
}
