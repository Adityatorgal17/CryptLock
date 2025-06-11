
## # 🔐 CryptLock Frontend

**CryptLock** is an open-source, privacy-first password manager built with cutting-edge client-side encryption. Designed with security at its core, CryptLock ensures that your sensitive information stays truly yours—**end-to-end encrypted**, **zero-knowledge**, and **enterprise-grade**.

## 🌐 Live Site

> [cryptlock.adityatorgal.me](https://cryptlock.adityatorgal.me)

---

## 🚀 Features

### 🔒 Enterprise-Grade Security – Built with Security in Mind

CryptLock ensures that your data remains private and secure using modern cryptographic standards, all executed locally in your browser. Here's how:

- ✅ **Vault Key Derivation** :
  Uses `PBKDF2(password + email, salt, 75,000 iterations)` to derive a strong encryption key. This key never leaves your device.
- ✅ **Auth Key Obfuscation** :
  Computes `SHA-256(vaultKey + email)` to generate an identifier for your vault without exposing sensitive information.
- ✅ **AES-GCM Encryption** :
  Vault data is encrypted using AES-256-GCM with a unique IV (Initialization Vector) on each operation to ensure both confidentiality and integrity.
- ✅ **Zero-Knowledge Architecture** :
  Vaults are encrypted and decrypted entirely on the client side. Even our servers cannot read your data—**by design**.
- ✅ **Client-Side Key Derivation** :
  All cryptographic operations happen locally. Your keys never leave your device, protecting you from data leaks or breaches on the server.

---

## 🧠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **Auth**: [Supabase Auth](https://supabase.com/)
- **State Management**: React hooks & context
- **Security**: Web Crypto API, AES-256-GCM, PBKDF2, SHA-256

---

## 📦 Getting Started

```bash
git clone https://github.com/Adityatorgal17/CryptLock cryptlock-frontend   
cd cryptlock-frontend
npm install
npm run dev

```

---

## 📄 License

MIT License © 2025 [Aditya Torgal](https://adityatorgal.me)

---

## 🙌 Contributing

We welcome contributions! If you want to suggest improvements or report bugs:

- Open an [issue](https://github.com/Adityatorgal17/CryptLock/issues)
- Submit a pull request
