import { env } from '$env/dynamic/private';
import { createHash } from 'crypto';

// Type definition for JWT payload
type JWTPayload = {
  sub: string;
  role: string;
  exp: number;
  [key: string]: unknown;
};

/**
 * Simple JWT implementation for authentication
 */
class JWT {
  private secret: string;

  constructor(options: { secret: string; algorithm: string }) {
    this.secret = options.secret;
  }

  /**
   * Sign a payload and return a JWT token
   */
  async sign(payload: JWTPayload): Promise<string> {
    // Simple implementation for development
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerStr = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.createSignature(`${headerStr}.${payloadStr}`);
    
    return `${headerStr}.${payloadStr}.${signature}`;
  }

  /**
   * Verify a JWT token and return the payload
   */
  async verify(token: string): Promise<JWTPayload> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const [headerB64, payloadB64, signature] = parts;
      
      // Verify signature
      const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      // Decode payload
      const payloadJson = Buffer.from(payloadB64, 'base64url').toString();
      const payload = JSON.parse(payloadJson) as JWTPayload;
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  /**
   * Create a signature for the JWT
   */
  private createSignature(data: string): string {
    return createHash('sha256')
      .update(data + this.secret)
      .digest('base64url');
  }
}

/**
 * Hash a password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = env.PASSWORD_SALT || 'dev-salt';
  return createHash('sha256')
    .update(password + salt)
    .digest('base64');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// JWT handling
const getJwt = () => {
  return new JWT({
    secret: env.JWT_SECRET || 'dev-secret',
    algorithm: 'HS256'
  });
};

export async function createToken(userId: string, role: string): Promise<string> {
  const jwt = getJwt();
  return jwt.sign({
    sub: userId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  });
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const jwt = getJwt();
    const payload = await jwt.verify(token);
    return {
      userId: payload.sub as string,
      role: payload.role as string
    };
  } catch (e) {
    return null;
  }
}
