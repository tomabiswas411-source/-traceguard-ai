import { db } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'traceguard_salt').digest('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = hashPassword(password);
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    },
  });
  
  return user;
}

export async function validateUser(email: string, password: string) {
  const hashedPassword = hashPassword(password);
  
  const user = await db.user.findUnique({
    where: { email },
  });
  
  if (!user || user.password !== hashedPassword) {
    return null;
  }
  
  return user;
}

export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return session;
}

export async function validateSession(token: string) {
  if (!token) return null;
  
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  
  return session;
}

export async function deleteSession(token: string) {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session might not exist
  }
}

export async function getUserFromToken(token: string | undefined) {
  if (!token) return null;
  
  const session = await validateSession(token);
  return session?.user || null;
}
