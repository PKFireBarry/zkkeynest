# Technology Stack

## Framework & Runtime
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Node.js 18+** required

## Authentication & Database
- **Clerk** for authentication (Google/GitHub OAuth)
- **Firebase/Firestore** for data storage
- **Stripe** for payment processing

## UI & Styling
- **Tailwind CSS 4** for styling
- **Shadcn UI** components (New York style)
- **Radix UI** primitives
- **Lucide React** for icons
- **Framer Motion** for animations
- **next-themes** for dark/light mode

## Security & Encryption
- **Web Crypto API** for client-side encryption
- **AES-GCM** encryption with random IV
- **PBKDF2** key derivation (100,000 iterations)

## Development Tools
- **TypeScript** with strict mode
- **ESLint** for code quality
- **Turbopack** for fast development builds
- **Bundle Analyzer** for performance monitoring

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Performance Analysis
```bash
npm run build:analyze    # Build with bundle analysis
npm run analyze         # Analyze client bundles
npm run analyze:server  # Analyze server bundles
npm run perf:report     # Generate performance report
```

### Component Management
```bash
npx shadcn@latest add <component>  # Add new Shadcn UI component
```

## Environment Variables
Required environment variables are documented in `.env.local`:
- Firebase configuration (client & admin)
- Stripe keys and webhook secret
- App configuration (URL, name)

## Build Configuration
- **Bundle size limits**: Pages <100kb, chunks <500kb, CSS <50kb
- **Performance monitoring** with Lighthouse integration
- **Webpack optimization** for production builds
- **Security headers** configured in next.config.ts