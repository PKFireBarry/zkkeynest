# zKkeynest Development Tasks

## Phase 1: MVP Development

### Setup & Infrastructure
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up Tailwind CSS and Shadcn UI
- [ ] Configure Firebase project and add credentials
- [ ] Set up Firestore database with proper security rules
- [ ] Configure environment variables
- [ ] Set up Stripe for payments (basic integration)

### Authentication System
- [x] Implement Google OAuth with Firebase Auth *(Switched to Clerk for better developer experience)*
- [x] Implement GitHub OAuth with Firebase Auth *(Switched to Clerk for better developer experience)*
- [x] Create authentication context and hooks *(Switched to Clerk - no custom context needed)*
- [x] Build login/logout components *(Clerk SignIn/SignUp components implemented)*
- [x] Add protected route middleware *(Clerk handles this automatically)*
- [x] Create user profile management *(Clerk provides this)*
- [x] Add loading state to sign-in page

### Security & Encryption
- [x] Implement PBKDF2 key derivation function
- [x] Create AES-GCM encryption/decryption utilities
- [x] Build master password creation flow
- [x] Implement master password verification system
- [x] Create secure key storage utilities
- [x] Add salt generation and management
- [x] Implement verification hash storage

### Core API Key Management
- [x] Design Firestore data schema for encrypted keys
- [x] Create API key CRUD operations
- [x] Build add new API key form
- [x] Implement API key list view
- [x] Create API key detail/edit modal
- [x] Add delete confirmation flow
- [x] Implement free tier limit (10 keys)

### User Interface
- [x] Design and build dashboard layout *(Landing/Hero page implemented as per UI mockup)*
- [x] Create navigation and sidebar (fixed anchor scroll offset bug with scroll-mt-20 on all sections)
- [x] Build API key card components
- [x] Implement search and basic filtering
- [x] Add loading states and error handling
- [x] Create responsive design for mobile *(All main sections and cards are now fully responsive and consistent across breakpoints)*
- [x] Improve mobile folder view experience *(Disabled drag and drop on mobile, created compact mobile cards, added mobile folder selection, optimized UI for touch interaction)*
- [x] Build master password unlock modal
- [x] Animate the two timers at the bottom of the Hero section so they count up (simulate timers): 20 min and 2 min
[x] Synchronize and reset the timers in the Hero section based on card animation cycles: OldWay resets after all options, ZKKeynest resets after each key, and ZKKeynest timer is 0-1 min.
- [x] Create a new EncryptionExplanation component that visually explains the client-side encryption process and security layers, matching the provided design and using the Card UI component for layout and style.
- [x] Add the new EncryptionExplanation component to the main page (below the Hero section) in page.tsx, ensuring it fits the overall layout and design.
- [x] Unify background color for all pages and sections to use theme background.
- [x] Add a theme toggle (light/dark) switch to the navigation bar using next-themes.
- [x] Update 'How It Works' section to match provided screenshot exactly
- [x] Update 'Perfect For' section to match mockup text and align cards *(Cards now match mockup text and are perfectly aligned)*
- [x] Refactor the 'Perfect For' section to fill one full screen, match card/grid/padding responsiveness and spacing to Hero/EncryptionExplanation, and ensure cards never touch the viewport edge
- [x] Create a new PricingSection component that matches the provided image, but fills the height of the screen (h-screen on md: and up, auto on mobile). The layout should be a centered heading and subheading, with three pricing cards in a row on desktop and stacked on mobile. The 'Pro Plan' card should have a 'Most Popular' badge. Each card should have a title, price, features list, and a call-to-action button. Use Tailwind CSS and Shadcn UI Card/Button components for styling. Ensure the design is clean, modern, and matches the image closely, but is fully responsive and fills the screen height on desktop.
- [x] Add a 'Coming Soon' badge to the Team Plan card and update the CTA button to be disabled with the label 'Coming Soon'. Also, add a subtle note below the button indicating that the Team Plan is not yet available. Use Tailwind for styling and ensure accessibility (aria-disabled, etc.).
- [x] Create a responsive footer component matching the provided image, but only include links and sections that exist in the app: Home, How it works (anchor), Pricing (anchor). Omit all non-existent pages. Include logo, app name, tagline, and social icons (with placeholder links). Use Tailwind CSS and ensure dark mode support. Copyright at the bottom.
- [x] Hide the how it works link in the dashboard navbar
- [x] Install framer-motion dependency to resolve build errors for animated components
- [x] Add user feedback funnel (feedback button, dialog, API, and storage)

### Data Management
- [x] Implement client-side encryption before storage
- [x] Create decryption flow for viewing keys
- [x] Add metadata fields (label, service, email, notes)
- [x] Implement data validation
- [x] Create backup/export functionality
- [x] Implement password-based backup recovery system
- [x] Add data migration utilities
- [x] Fix clear data feature to properly delete all user data (API keys and shares)

### Payment Integration
- [x] Set up Stripe customer management
- [x] Create subscription plans (Free/Pro)
- [x] Implement upgrade flow
- [x] Add usage tracking and limits
- [x] Create billing dashboard
- [x] Handle subscription cancellations

### Testing & Quality Assurance
- [ ] Write unit tests for encryption utilities
- [ ] Test authentication flows
- [ ] Validate security implementation
- [ ] Test payment integration
- [ ] Perform cross-browser testing
- [ ] Test responsive design

### Deployment & DevOps
- [ ] Set up Vercel deployment
- [ ] Configure custom domain

## Phase 2: Pro Tier Features

### Enhanced UI/UX
- [x] Implement advanced search with filters
- [x] Add tags and categories system
- [x] Create folder/organization features
- [x] Add dark/light theme toggle


### Advanced Features
- [X] Add unlimited key storage for Pro users
- [x] Implement session timeout settings
- [x] Implement key rotation reminders


### Performance Optimization
- [ ] Implement virtual scrolling for large lists
- [ ] Add caching strategies
- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Add service worker for offline support

## Phase 3: Team Features

### Collaboration System
- [ ] Design team data schema
- [ ] Implement shared vaults
- [ ] Create role-based permissions
- [ ] Build team invitation system
- [ ] Add activity logging
- [ ] Create admin dashboard
- [ ] Create key usage analytics

### Enterprise Features
- [ ] Implement SSO integration
- [ ] Add audit trails
- [ ] Create compliance reporting
- [ ] Build team analytics
- [ ] Add custom branding options

## Security Implementation Details

### Master Password Flow
1. User creates master password
2. Generate random salt
3. Derive encryption key using PBKDF2
4. Create verification hash
5. Store salt and verification hash in Firestore
6. Never store the actual password or derived key

### API Key Encryption
1. Use derived key to encrypt API key with AES-GCM
2. Generate random IV for each encryption
3. Store encrypted data, IV, and metadata
4. Decrypt only when master password is provided

### One-Time Sharing
- [x] Generate unique symmetric key for share
- [x] Encrypt API key with share key
- [x] Create unique URL with encrypted data
- [x] Store share metadata with expiration
- [x] Decrypt on recipient's browser
- [x] Invalidate share after use
- [x] Allow multiple share links to be created and viewed in a single modal session (no reload required)

## Technical Requirements

### Dependencies
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- Firebase SDK
- Stripe SDK
- Web Crypto API
- framer-motion *(installed to resolve build errors)*

### Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Database Schema
```typescript
// Users collection
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  subscription: 'free' | 'pro' | 'team';
  masterPasswordSalt: string;
  masterPasswordHash: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// API Keys collection
interface ApiKey {
  id: string;
  userId: string;
  label: string;
  service: string;
  email: string;
  notes: string;
  encryptedData: string;
  iv: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Shares collection
interface Share {
  id: string;
  apiKeyId: string;
  createdBy: string;
  encryptedData: string;
  shareKey: string;
  expiresAt: Timestamp;
  used: boolean;
  createdAt: Timestamp;
}
```

## Success Criteria

### MVP Launch Ready
- [ ] Users can sign up with Google/GitHub
- [ ] Users can create and manage up to 10 API keys
- [ ] All data is encrypted client-side
- [ ] Master password protects access to keys
- [ ] Responsive design works on all devices
- [ ] Payment integration allows upgrades
- [ ] Security audit passes
- [ ] Performance meets standards

### Metrics to Track
- User registration and retention
- API key storage usage
- Free to paid conversion rate
- Security incident reports
- User feedback scores
- Performance metrics

## Timeline Estimate

### Phase 1 (MVP): 6-8 weeks
- Week 1-2: Setup and authentication
- Week 3-4: Security and encryption
- Week 5-6: Core features and UI
- Week 7-8: Testing and deployment

### Phase 2 (Pro): 4-6 weeks
- Week 1-2: Enhanced features
- Week 3-4: Performance optimization
- Week 5-6: Testing and refinement

### Phase 3 (Teams): 8-12 weeks
- Week 1-4: Collaboration features
- Week 5-8: Enterprise features
- Week 9-12: Testing and security audit 
[x] Polish homepage grammar, spelling, and text issues (see summary for details) 
[x] Remove all em dashes (—) from homepage components for consistency and accessibility 