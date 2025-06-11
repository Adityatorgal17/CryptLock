import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bufToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex');
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

export function generateSalt(length = 16): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

/* ----------------- Key Derivation (PBKDF2) ----------------- */
export async function deriveKey(
  password: string | Uint8Array,
  salt: Uint8Array,
  iterations = 75000,
  keyLen = 64
): Promise<Uint8Array> {
  const passKey = typeof password === 'string'
    ? await window.crypto.subtle.importKey('raw', encodeUtf8(password), { name: 'PBKDF2' }, false, ['deriveBits'])
    : await window.crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, ['deriveBits']);

  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-512' },
    passKey,
    keyLen * 8
  );
  return new Uint8Array(bits);
}

export async function deriveVaultKey(password: string, email: string, salt: Uint8Array): Promise<string> {
  const combined = password + email;
  const vaultKeyBytes = await deriveKey(combined, salt);
  return bufToHex(vaultKeyBytes.buffer);
}

export async function deriveAuthKey(vaultKeyHex: string, email: string): Promise<string> {
  const data = encodeUtf8(vaultKeyHex + email);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufToHex(hashBuffer);
}

export async function encryptVault(
  vaultData: object,
  vaultKeyHex: string
): Promise<{ encrypted: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyBytes = hexToUint8Array(vaultKeyHex).slice(0, 32);

  const key = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const plaintext = encodeUtf8(JSON.stringify(vaultData));
  const encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptVault(
  encryptedBase64: string,
  vaultKeyHex: string,
  ivBase64: string
): Promise<object> {
  const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
  const keyBytes = hexToUint8Array(vaultKeyHex).slice(0, 32);

  const key = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const encryptedBytes = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedBytes);

  return JSON.parse(new TextDecoder().decode(decryptedBuffer));
}
