export interface User {
  id: string;
  email: string;
  token: string;
  salt?: string;
}

export interface SignupData {
  email: string;
  password: string;
  authKey: string;
  salt: string;
}

export interface SigninData {
  email: string;
  password: string;
  token?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function signup(data: SignupData) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return response.json();
}

export async function signin(data: SigninData) {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signin failed');
  }
  return response.json();
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}