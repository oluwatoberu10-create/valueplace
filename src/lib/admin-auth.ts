import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "vpp_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;

function password(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length >= MIN_PASSWORD_LENGTH ? value : null;
}

export function adminConfigured(): boolean {
  return password() !== null;
}

function sign(expires: string, secret: string): string {
  return createHmac("sha256", secret).update(`vpp-admin:${expires}`).digest("hex");
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordMatches(attempt: string): boolean {
  const expected = password();
  if (!expected) return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return safeEqual(hash(attempt), hash(expected));
}

export async function startAdminSession(): Promise<void> {
  const secret = password();
  if (!secret) return;
  const expires = String(Date.now() + SESSION_MS);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, secret)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_ADMIN_COOKIE !== "1",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

/** Changing ADMIN_PASSWORD signs everyone out, because the password is the signing secret. */
export async function isAdmin(): Promise<boolean> {
  const secret = password();
  if (!secret) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(Buffer.from(signature), Buffer.from(sign(expires, secret)));
}
