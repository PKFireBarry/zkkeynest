# zKkeynest Homepage Content Guide

## Hero Section

### Headline
**"Your API keys, organized and secure"**

### Subheadline
**"Stop juggling multiple accounts. Store all your API keys in one secure vault with zero-knowledge encryption."**

### Primary CTA
**"Get Started Free"** (10 API keys included)

### Secondary CTA
**"How it works"** (scroll to explanation)

---

## How It Works Section

### Section Title
**"How zKkeynest Works"**

### Step-by-Step Explanation

#### Step 1: Quick Login
```
🔐 Login with Google or GitHub
```
**"Sign in with your existing account - no new passwords to remember"**

#### Step 2: Set Your Master Password
```
🔑 Create your master password
```
**"This single password encrypts all your API keys. We never see it - only you can unlock your vault."**

#### Step 3: Add Your API Keys
```
➕ Store your API keys securely
```
**"Add labels, notes, and organize by service. Everything is encrypted before it reaches our servers."**

#### Step 4: Access When You Need
```
🔓 Unlock and use your keys
```
**"Enter your master password to view your API keys. Auto-locks for security."**

---

## Key Benefits Section

### "Why Developers Choose zKkeynest"

#### 🔒 **Zero-Knowledge Security**
**"Your data, your control"**
- We never see your API keys or master password
- All encryption happens in your browser
- Even we can't access your data

#### ⚡ **Quick & Easy**
**"No more account juggling"**
- One login with Google/GitHub
- Find any API key in seconds
- No more forgotten keys or accounts

#### 🔗 **Secure Sharing**
**"Share keys safely"**
- Create one-time encrypted links
- Recipients see the key once, then it expires
- No more risky copy-paste in chat

#### 💰 **Developer-Friendly Pricing**
**"Start free, upgrade when you need"**
- Free: 10 API keys
- Pro: $3/month for unlimited keys
- Team: $10/user/month for collaboration

---

## Use Cases Section

### "Perfect For"

#### 🚀 **Solo Developers**
**"Manage multiple free-tier accounts"**
- Store API keys from different email accounts
- Never forget which key belongs to which service
- Keep your development workflow smooth

#### 👥 **Small Teams**
**"Secure key sharing without the risk"**
- Share API keys with team members safely
- No more Slack DMs with sensitive data
- Track who accessed what and when

#### 🏢 **Startups**
**"Professional key management without enterprise complexity"**
- Simple setup, powerful security
- Affordable pricing for growing teams
- Focus on building, not managing keys

---

## Security Explanation Section

### "How We Keep Your Keys Safe"

#### 🔐 **Client-Side Encryption**
```
Your Browser → Encrypts → Our Servers
```
**"Your API keys are encrypted in your browser before they ever reach our servers. We only store encrypted data that we can't read."**

#### 🛡️ **Master Password Protection**
```
Your Password → Never Stored → Only You Know
```
**"Your master password never leaves your device. We only store a verification hash to check if it's correct."**

#### 🔄 **One-Time Sharing**
```
Create Link → Share Securely → Expires After Use
```
**"Generate encrypted links that show the API key once, then automatically expire. Perfect for temporary access."**

---

## Security Architecture Section

### "How We Keep Your Keys Secure"

#### 🔐 **Client-Side Encryption Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    ENCRYPTION PROCESS                      │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  🔑 Your API Key: "sk-1234567890abcdef"                 │
│                                                           │
│  🔐 AES-GCM Encryption (your browser)                    │
│     Key derived from: Master Password + User ID + Salt    │
│     Result: "aBcDeFgHiJkLmNoPqRsTuVwXyZ"                 │
│                                                           │
│  📦 Stored in Firestore: "aBcDeFgHiJkLmNoPqRsTuVwXyZ"    │
│     + IV (Initialization Vector)                          │
│     + Salt (for key derivation)                           │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

#### 🛡️ **Zero-Knowledge Architecture**

**What happens in your browser:**
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Encryption**: AES-GCM with random IV
- **Verification**: Hash-based password verification
- **Storage**: Only encrypted data + metadata

**What we never see:**
- ❌ Your master password
- ❌ Your derived encryption key
- ❌ Your plaintext API keys
- ❌ Your decryption process

#### 🔐 **Security Model**

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  🔐 Layer 1: Google/GitHub OAuth                         │
│     (Account authentication)                              │
│                                                           │
│  🔑 Layer 2: Master Password                             │
│     (Vault encryption key)                               │
│                                                           │
│  🛡️ Layer 3: Client-Side Encryption                      │
│     (AES-GCM with PBKDF2)                                │
│                                                           │
│  🔒 Layer 4: Zero-Knowledge Storage                      │
│     (We can't decrypt your data)                         │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

#### 🔗 **One-Time Sharing Security**

**Share Creation Process:**
1. **Generate unique symmetric key** for the share
2. **Encrypt API key** with share-specific key
3. **Store encrypted data** with expiration timestamp
4. **Create share URL** with unique identifier

**Share Access Process:**
1. **Recipient clicks link** → loads share page
2. **Decrypt API key** using share key (client-side)
3. **Display key once** → mark share as used
4. **Invalidate share** → prevent future access

#### 🎯 **Why This Matters for Developers**

**Traditional approach problems:**
- API keys stored in plaintext on servers
- Passwords stored in databases (even hashed)
- Server-side encryption (we can decrypt)
- Shared credentials in chat/email

**zKkeynest approach:**
- ✅ Client-side encryption (we can't decrypt)
- ✅ Zero password storage (only verification hash)
- ✅ One-time sharing (no persistent access)
- ✅ Auto-locking vault (session timeout)

#### 🔍 **Technical Implementation**

**Key Derivation:**
```javascript
// PBKDF2 with 100,000 iterations
const derivedKey = await crypto.subtle.deriveKey({
  name: 'PBKDF2',
  salt: userSalt,
  iterations: 100000,
  hash: 'SHA-256'
}, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
```

**Encryption:**
```javascript
// AES-GCM with random IV
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt({
  name: 'AES-GCM',
  iv: iv
}, derivedKey, data);
```

**Verification:**
```javascript
// Hash-based verification (no password storage)
const verificationHash = await createVerificationHash(derivedKey, salt);
// Only store: salt + verificationHash
```

#### 🚀 **Developer Benefits**

**Security:**
- End-to-end encryption
- Zero-knowledge architecture
- Cryptographically secure
- No server-side decryption

**Usability:**
- Simple OAuth login
- Master password for vault access
- One-time sharing links
- Auto-locking sessions

**Transparency:**
- Open about what we can/can't see
- Clear about security model
- Honest about limitations
- No hidden data collection

---

## Pricing Section

### "Simple, Transparent Pricing"

#### 🆓 **Free Plan**
- **10 API keys**
- Basic organization
- Secure sharing
- **$0/month**

#### ⭐ **Pro Plan**
- **Unlimited API keys**
- Advanced search & filtering
- Tags & categories
- Export functionality
- **$3/month**

#### 👥 **Team Plan**
- **Shared vaults**
- Role-based permissions
- Activity logging
- Admin dashboard
- **$10/user/month**

---

## FAQ Section

### "Frequently Asked Questions"

#### 🤔 **"What if I forget my master password?"**
**"We can't recover it - that's how we keep your data secure. You can reset your vault and start fresh, but you'll need to re-add your API keys."**

#### 🔐 **"How is this different from a password manager?"**
**"zKkeynest is built specifically for API keys with developer-focused features like service tagging, email association, and secure team sharing."**

#### 💰 **"What happens when I hit the 10-key limit?"**
**"You'll get a friendly upgrade prompt. Your existing keys stay safe, and you can upgrade to Pro for unlimited storage."**

#### 🚀 **"Can I share API keys with my team?"**
**"Yes! Create one-time encrypted links or upgrade to Team plan for permanent shared vaults with role-based access."**

---

## Social Proof Section

### "Trusted by Developers"

#### 💬 **Testimonials**
**"Finally, a simple way to manage all my API keys without the enterprise complexity."**
*- Sarah Chen, Full-Stack Developer*

**"The one-time sharing feature is brilliant. No more risky Slack messages with API keys."**
*- Mike Rodriguez, DevOps Engineer*

**"Perfect for our small team. We can share keys securely without the overhead of enterprise tools."**
*- Alex Thompson, Startup CTO*

---

## CTA Section

### "Ready to Organize Your API Keys?"

#### Primary CTA
**"Start Free - No Credit Card Required"**

#### Secondary CTA
**"View Demo"** (link to interactive demo)

#### Trust Indicators
- "🔒 Zero-knowledge encryption"
- "⚡ Setup in 2 minutes"
- "💰 Free for 10 API keys"

---

## Footer Section

### Quick Links
- **Product**: Features, Pricing, Security
- **Support**: Help Center, Contact
- **Company**: About, Blog, Careers

### Legal
- Privacy Policy
- Terms of Service
- Security

### Social
- Twitter
- GitHub
- LinkedIn

---

## Technical Details (For Developers)

### "Built for Developers"

#### 🛠️ **Tech Stack**
- Next.js 15, React 19, TypeScript
- Web Crypto API for client-side encryption
- Firebase for authentication and storage
- Stripe for payments

#### 🔒 **Security Features**
- AES-GCM encryption with PBKDF2 key derivation
- 100,000 iterations for key derivation
- Random salt generation for each user
- Verification hash system (no password storage)

#### 📱 **Platform Support**
- Web app (responsive design)
- Works on desktop, tablet, mobile
- No app installation required
- Cross-browser compatibility

---

## Content Guidelines

### Tone & Voice
- **Friendly but professional**
- **Technical but accessible**
- **Security-focused but not scary**
- **Developer-centric but inclusive**

### Key Messages
1. **Simplicity**: "No more juggling accounts"
2. **Security**: "Zero-knowledge encryption"
3. **Value**: "Free for 10 API keys"
4. **Trust**: "We can't see your data"

### Visual Elements
- Use icons for each step
- Show before/after scenarios
- Include screenshots of the interface
- Highlight security features with lock icons

### Call-to-Actions
- Primary: "Get Started Free"
- Secondary: "How it works"
- Tertiary: "View Demo" 