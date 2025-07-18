# zKkeynest - Secure API Key Management Platform

## Project Overview

zKkeynest is a lightweight, secure API key vault built for solo developers and small teams who juggle multiple accounts and want to manage their API keys effortlessly all in one place. With zero-knowledge encryption and simple social login, users can safely store and share API keys without exposing secrets in insecure channels.

## Problem Statement

Developers waste time juggling multiple accounts and API keys, often:
- Storing them unsafely in chat logs or emails
- Forgetting which API key belongs to which account
- Having to constantly log in/out of different accounts to retrieve keys
- Lacking a cheap secure way to share keys with team members

## Solution

A web-based vault with:
- **Zero-knowledge encryption**: All encryption/decryption happens client-side
- **Social login**: Google/GitHub authentication for frictionless access
- **Master password protection**: Additional security layer for viewing keys
- **One-time sharing**: Secure, encrypted links that expire after use
- **Team collaboration**: Shared vaults with role-based access

## Core Features

### MVP (Phase 1)
- [ ] Google/GitHub OAuth authentication
- [ ] Master password creation and verification
- [ ] Client-side encryption using Web Crypto API
- [ ] Store up to 10 API keys (free tier)
- [ ] Basic metadata: label, service, email, notes
- [ ] View/Edit/Delete API keys
- [ ] Master password unlock flow
- [ ] Responsive web UI

### Pro Tier (Phase 2)
- [ ] Unlimited API keys
- [ ] Advanced search and filtering
- [ ] Tags and categories
- [ ] Export functionality
- [ ] Session timeout settings
- [ ] Enhanced UI/UX

### Team Features (Phase 3)
- [ ] Shared vaults
- [ ] Role-based permissions
- [ ] Activity logging
- [ ] Admin dashboard
- [ ] SSO integration

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Payments**: Stripe

### Security Implementation
- **Encryption**: AES-GCM with PBKDF2 key derivation
- **Master Password**: Never stored, only verification hash
- **Key Derivation**: User UID + salt + master password
- **One-time Sharing**: Symmetric encryption with unique keys

### Data Flow
1. User logs in with Google/GitHub
2. Creates master password (derived key + verification hash)
3. API keys encrypted client-side before storage
4. Decryption only possible with master password
5. One-time shares use separate encryption keys

## Business Model

### Pricing Tiers
- **Free**: 10 API keys, basic features
- **Pro**: $3/month, unlimited keys, advanced features
- **Team**: $10/user/month, collaboration features

### Monetization Strategy
- Freemium model with clear upgrade path
- Focus on solo developers initially
- Expand to small teams and enterprise

## Competitive Advantage

### Market Gap
- More focused than Bitwarden (API-specific features)
- Simpler than HashiCorp Vault (no infrastructure)
- More affordable than enterprise solutions
- Unique one-time sharing feature

### Target Users
1. **Solo developers** managing multiple free-tier accounts
2. **Small teams** (2-10 people) needing secure key sharing
3. **Startups** wanting simple, affordable key management

## Success Metrics
- User adoption and retention
- Conversion from free to paid
- Team feature adoption
- Security audit results
- User feedback and satisfaction

## YC Pitch Angle

"We're building a secure, no-friction API key vault for developers and small teams. Starting with solo devs scraping together free-tier access to build products, we scale into team workflows where API keys are a core but messy part of the stack. There's no clean solution for lightweight, encrypted key sharing today—and we're solving that."

## Risk Mitigation
- **Security**: Zero-knowledge architecture, regular audits
- **Competition**: Focus on developer experience and simplicity
- **Adoption**: Clear value proposition, freemium model
- **Scale**: Cloud-native architecture, automated scaling 