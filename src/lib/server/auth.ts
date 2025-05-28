import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 2, // 2 hours for testing (shorter to see difference)
    updateAge: 60 * 30, // 30 minutes
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes cache
    }
  },
  // Configure cookie behavior
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },
  trustedOrigins: ['http://localhost:5173'],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!
})
