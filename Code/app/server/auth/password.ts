const PASSWORD_ALGORITHM = "pbkdf2-sha256";
const PASSWORD_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const saltBuffer = new Uint8Array(salt).buffer as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations },
    key,
    HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export function constantTimeStringEqual(left: string, right: string): boolean {
  return constantTimeEqual(new TextEncoder().encode(left), new TextEncoder().encode(right));
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 200) {
    throw new Error("Mật khẩu phải có từ 12 đến 200 ký tự.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const digest = await derive(password, salt, PASSWORD_ITERATIONS);
  return [PASSWORD_ALGORITHM, PASSWORD_ITERATIONS, toBase64Url(salt), toBase64Url(digest)].join("$");
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [algorithm, rawIterations, rawSalt, rawDigest] = encodedHash.split("$");
  const iterations = Number(rawIterations);
  if (
    algorithm !== PASSWORD_ALGORITHM
    || !Number.isInteger(iterations)
    || iterations < 100_000
    || iterations > 1_000_000
    || !rawSalt
    || !rawDigest
  ) return false;

  try {
    const salt = fromBase64Url(rawSalt);
    const expected = fromBase64Url(rawDigest);
    const actual = await derive(password, salt, iterations);
    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function consumeDummyPasswordWork(password: string): Promise<void> {
  const dummySalt = new TextEncoder().encode("tra-sua-ngon-auth").slice(0, SALT_BYTES);
  await derive(password, dummySalt, PASSWORD_ITERATIONS);
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(digest));
}

export function randomToken(bytes = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}
