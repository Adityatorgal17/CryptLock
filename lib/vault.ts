import {
  encryptVault,
  decryptVault,
  deriveVaultKey,
  deriveAuthKey,
  generateSalt,
  bufToHex
} from './utils';

export interface VaultItem {
  id: string;
  site: string;
  username: string;
  password: string;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

export interface PasswordGeneratorOptions {
  length: number;
  includeSpecialChars: boolean;
  includeNumbers: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

let vaultKeyCache: string | null = null;

export function setVaultKey(key: string): void {
  vaultKeyCache = key;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('vault_key', key);
  }
}

export function getVaultKey(): string | null {
  if (vaultKeyCache) return vaultKeyCache;

  if (typeof window !== 'undefined') {
    const key = sessionStorage.getItem('vault_key');
    vaultKeyCache = key;
    return key;
  }

  return null;
}

export function clearVaultKey(): void {
  vaultKeyCache = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('vault_key');
  }
}

export async function getVault(): Promise<VaultItem[]> {
  const response = await fetch(`${API_BASE_URL}/vault`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch vault');
  }

  const data = await response.json();

  if (!data.encrypted || !data.iv) return [];

  const vaultKey = getVaultKey();
  if (!vaultKey) throw new Error('Vault key not available. Please re-authenticate.');

  try {
    const decryptedData = await decryptVault(data.encrypted, vaultKey, data.iv);
    return Array.isArray(decryptedData) ? decryptedData : [];
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt vault data. Invalid vault key.');
  }
}

export async function saveVault(items: VaultItem[]): Promise<void> {
  const vaultKey = getVaultKey();
  if (!vaultKey) throw new Error('Vault key not available. Please re-authenticate.');

  try {
    const encryptedPayload = await encryptVault(items, vaultKey);

    const response = await fetch(`${API_BASE_URL}/vault`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to save vault');
    }
  } catch (error) {
    console.error('Error in saveVault:', error);
    throw error;
  }
}

export async function updateVault(items: VaultItem[]): Promise<void> {
  const vaultKey = getVaultKey();
  if (!vaultKey) throw new Error('Vault key not available. Please re-authenticate.');

  try {
    const encryptedPayload = await encryptVault(items, vaultKey);

    const response = await fetch(`${API_BASE_URL}/vault`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to update vault');
    }
  } catch (error) {
    console.error('Error in updateVault:', error);
    throw error;
  }
}

export async function addVaultItem(newItem: VaultItem): Promise<VaultItem[]> {
  try {
    const currentVault = await getVault();
    const updatedVault = [...currentVault, newItem];
    
    if (currentVault.length === 0) {
      await saveVault(updatedVault); 
    } else {
      await updateVault(updatedVault); 
    }
    
    return updatedVault;
  } catch (error) {
    console.error('Error in addVaultItem:', error);
    throw error;
  }
}

export async function updateVaultItem(updatedItem: VaultItem): Promise<VaultItem[]> {
  const currentVault = await getVault();
  const updatedVault = currentVault.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  );

  await updateVault(updatedVault);
  return updatedVault;
}

export async function deleteVaultItem(itemId: string): Promise<VaultItem[]> {
  const currentVault = await getVault();
  const updatedVault = currentVault.filter(item => item.id !== itemId);

  await updateVault(updatedVault);
  return updatedVault;
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const { length, includeSpecialChars, includeNumbers, includeUppercase, includeLowercase } = options;

  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) throw new Error('At least one character type must be selected');

  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes, byte => charset[byte % charset.length]).join('');
}

export async function exportVault(): Promise<{ data: VaultItem[]; exportedAt: string }> {
  const vaultItems = await getVault();

  return {
    data: vaultItems,
    exportedAt: new Date().toISOString(),
  };
}

export async function importVault(importedItems: VaultItem[], mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<void> {
  if (!Array.isArray(importedItems)) {
    throw new Error('Invalid import data: expected array of vault items');
  }

  for (const item of importedItems) {
    if (!item.id || !item.site || !item.username || !item.password || !item.createdAt) {
      throw new Error('Invalid import data: missing required fields in vault items');
    }
  }

  if (mergeStrategy === 'replace') {
    await updateVault(importedItems);
  } else {
    const currentVault = await getVault();
    const existingIds = new Set(currentVault.map(item => item.id));
    const newItems = importedItems.filter(item => !existingIds.has(item.id));
    const mergedVault = [...currentVault, ...newItems];
    await updateVault(mergedVault);
  }
}

export async function createUserKeys(email: string, masterPassword: string): Promise<{
  vaultKey: string;
  authKey: string;
  salt: string;
}> {
  const salt = generateSalt(32);
  const vaultKey = await deriveVaultKey(masterPassword, email, salt);
  const authKey = await deriveAuthKey(vaultKey, email);

  return {
    vaultKey,
    authKey,
    salt: bufToHex(salt.buffer),
  };
}

export async function initializeVaultKey(
  email: string,
  masterPassword: string,
  userSalt: string
): Promise<string> {
  const salt = new Uint8Array(userSalt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const vaultKey = await deriveVaultKey(masterPassword , email, salt);
  setVaultKey(vaultKey);
  return vaultKey;
}

export async function generateAuthKey(
  email: string,
  masterPassword: string,
  userSalt: string
): Promise<string> {
  const salt = new Uint8Array(userSalt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const vaultKey = await deriveVaultKey(masterPassword , email, salt);
  return await deriveAuthKey(vaultKey, email);
}
