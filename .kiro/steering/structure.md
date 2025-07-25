# Project Structure

## Root Directory
```
├── .kiro/                  # Kiro AI assistant configuration
├── src/                    # Source code
├── public/                 # Static assets
├── performance-reports/    # Performance monitoring data
├── scripts/               # Build and utility scripts
└── package.json           # Dependencies and scripts
```

## Source Code Organization (`src/`)

### App Router (`src/app/`)
- **Next.js 15 App Router** structure
- **Route handlers** in `api/` subdirectories
- **Page components** as `page.tsx` files
- **Layout components** as `layout.tsx` files
- **Loading states** as `loading.tsx` files

Key routes:
- `/` - Landing page
- `/dashboard` - Main application dashboard
- `/sign-in`, `/sign-up` - Authentication pages
- `/share/[shareId]` - One-time share links
- `/api/` - Server-side API endpoints

### Components (`src/components/`)
- **UI components** in `ui/` subdirectory (Shadcn UI)
- **Feature components** in root components directory
- **Naming convention**: PascalCase with descriptive names
- **Component patterns**: Compound components for complex UI

### Library Code (`src/lib/`)
- **Utility functions** (`utils.ts` - includes `cn()` helper)
- **Database operations** (`database.ts`)
- **Encryption logic** (`encryption.ts`)
- **Firebase configuration** (`firebase.ts`)
- **Stripe integration** (`stripe.ts`)
- **Validation schemas** (`validation.ts`)

### Contexts (`src/contexts/`)
- **VaultContext** - Manages encryption state and vault operations
- **React Context pattern** for global state management

### Types (`src/types/`)
- **TypeScript definitions** in `index.ts`
- **Interface definitions** for all data models
- **Enum definitions** for constants

### Hooks (`src/hooks/`)
- **Custom React hooks** for reusable logic
- **Performance monitoring hooks**
- **Subscription management hooks**

## File Naming Conventions
- **Components**: PascalCase (e.g., `ApiKeyList.tsx`)
- **Pages**: lowercase with hyphens (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: camelCase (e.g., `index.ts`)

## Import Patterns
- **Absolute imports** using `@/` alias
- **Path mapping** configured in `tsconfig.json`
- **Barrel exports** from `src/types/index.ts`

## Component Architecture
- **Compound components** for complex UI (e.g., dialogs, forms)
- **Prop drilling avoided** using React Context
- **Client/Server components** clearly separated
- **Error boundaries** for graceful error handling

## Security Considerations
- **Client-side encryption** logic in `src/lib/encryption.ts`
- **Server-side validation** in API routes
- **Environment variables** properly scoped
- **No sensitive data** in client-side code