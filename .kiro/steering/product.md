# Product Overview

zKkeynest is a secure API key management application designed for solo developers and small teams. The core value proposition is zero-knowledge encryption with client-side security.

## Key Features
- **Zero-Knowledge Encryption**: All encryption/decryption happens client-side using Web Crypto API
- **Master Password Protection**: Additional security layer for viewing keys
- **One-Time Sharing**: Secure, encrypted links that expire after use
- **Quick Setup**: Google/GitHub OAuth authentication via Clerk
- **Developer-Friendly Pricing**: Free tier with 10 API keys, paid tiers for more

## Security Architecture
- Client-side encryption using AES-GCM with random IV
- PBKDF2 key derivation with 100,000 iterations
- Master password never stored, only verification hash
- Session timeout management for vault auto-locking
- Separate encryption keys for one-time shares

## User Flow
1. User authenticates via Clerk (Google/GitHub OAuth)
2. Creates master password (derived key + verification hash stored)
3. API keys encrypted client-side before Firestore storage
4. Decryption only possible with master password
5. Vault auto-locks after configurable timeout

## Target Users
- Solo developers managing multiple API keys
- Small development teams needing secure key sharing
- Developers who prioritize security and privacy