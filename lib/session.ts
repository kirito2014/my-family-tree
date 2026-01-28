'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key-here';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UserPayload {
  userId: string;
  username: string;
  [key: string]: any;
}

export async function generateToken(userId: string) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(SECRET_KEY);
  
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Date.now() + SESSION_EXPIRY)
    .sign(secretKey);
}

export async function verifyToken(token: string) {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(SECRET_KEY);
  
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const payload: UserPayload = { userId, username };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Date.now() + SESSION_EXPIRY)
    .sign(new TextEncoder().encode(SECRET_KEY));

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY / 1000,
    path: '/',
  });
  
  return { success: true, token };
}

export async function verifySession() {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    );
    return payload as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, name: true, email: true, avatar: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function destroySession() {
  cookies().delete('session');
  return { success: true };
}
