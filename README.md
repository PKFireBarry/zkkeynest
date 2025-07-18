# zKkeynest - Secure API Key Management

A lightweight, secure API key vault built for solo developers and small teams who juggle multiple accounts and want to manage their API keys effortlessly.

## Features

- 🔐 **Zero-Knowledge Encryption**: All encryption/decryption happens client-side
- 🔑 **Master Password Protection**: Additional security layer for viewing keys
- 🔗 **One-Time Sharing**: Secure, encrypted links that expire after use
- ⚡ **Quick Setup**: Google/GitHub OAuth authentication
- 💰 **Developer-Friendly Pricing**: Free tier with 10 API keys

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Payments**: Stripe
- **Security**: Web Crypto API (AES-GCM + PBKDF2)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zkkeynest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=zKkeynest
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Shadcn UI components
│   └── ...                # Custom components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── VaultContext.tsx   # Vault encryption state
├── lib/                   # Utility functions
│   ├── firebase.ts        # Firebase configuration
│   ├── encryption.ts      # Encryption utilities
│   └── utils.ts           # General utilities
└── types/                 # TypeScript type definitions
    └── index.ts           # Application types
```

## Security Implementation

### Zero-Knowledge Architecture

- **Client-Side Encryption**: All API keys are encrypted in the browser before reaching our servers
- **Master Password**: Never stored, only verification hash is saved
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Encryption**: AES-GCM with random IV for each key

### Data Flow

1. User logs in with Google/GitHub
2. Creates master password (derived key + verification hash)
3. API keys encrypted client-side before storage
4. Decryption only possible with master password
5. One-time shares use separate encryption keys

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Components

To add new Shadcn UI components:

```bash
npx shadcn@latest add <component-name>
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@zkkeynest.com or join our Discord community.
