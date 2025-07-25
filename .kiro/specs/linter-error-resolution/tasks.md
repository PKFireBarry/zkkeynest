# Implementation Plan

- [ ] 1. Create utility functions and type definitions for common patterns
  - Add JSX entity escaping utility function to src/lib/utils.ts
  - Add common event handler type definitions to src/types/index.ts
  - Add API response interfaces to replace any types
  - _Requirements: 3.1, 3.2, 4.1, 4.2_

- [ ] 2. Fix explicit any types in utility and library files
  - [ ] 2.1 Fix any types in src/hooks/usePerformanceHooks.ts
    - Replace any types with proper interfaces for performance metrics
    - Add type definitions for performance observer entries
    - _Requirements: 3.1, 3.2_

  - [ ] 2.2 Fix any types in src/lib/backup.ts and src/lib/validation.ts
    - Replace any types with proper interfaces for backup data structures
    - Add type definitions for validation functions
    - _Requirements: 3.1, 3.2_

- [ ] 3. Fix explicit any types in component files
  - [ ] 3.1 Fix any types in src/components/ClerkLoadingWrapper.tsx
    - Replace any type with proper React component props type
    - _Requirements: 3.1, 3.2_

  - [ ] 3.2 Fix any types in src/components/FeedbackDialog.tsx
    - Replace any type with proper form event handler type
    - _Requirements: 3.1, 3.2_

  - [ ] 3.3 Fix any types in src/components/FolderDragAndDrop.tsx
    - Replace any types with proper drag event handler types
    - _Requirements: 3.1, 3.2_

  - [ ] 3.4 Fix any types in src/components/RotationReminderSettings.tsx
    - Replace any types with proper form event handler types
    - _Requirements: 3.1, 3.2_

  - [ ] 3.5 Fix any types in src/components/SidebarNavigation.tsx
    - Replace any types with proper keyboard event handler types
    - _Requirements: 3.1, 3.2_

- [ ] 4. Fix explicit any types in API route files
  - [ ] 4.1 Fix any types in src/app/api/feedback/route.ts
    - Replace any type with proper request body interface
    - _Requirements: 3.1, 3.3_

  - [ ] 4.2 Fix any types in src/app/api/stripe/webhook/route.ts
    - Replace any type with proper Stripe event interface
    - _Requirements: 3.1, 3.3_

- [ ] 5. Remove unused imports and variables
  - [ ] 5.1 Clean up unused imports in component files
    - Remove unused imports from src/components/ApiKeyList.tsx, BackupExport.tsx, BillingDashboard.tsx
    - Remove unused imports from src/components/CreateShareModal.tsx, DashboardContent.tsx, DataManagement.tsx
    - _Requirements: 1.1, 1.2_

  - [ ] 5.2 Clean up unused imports in remaining component files
    - Remove unused imports from src/components/DraggableApiKeyCard.tsx, FolderDragAndDrop.tsx
    - Remove unused imports from src/components/MobileApiKeyCard.tsx, TrustCredibility.tsx
    - _Requirements: 1.1, 1.2_

  - [ ] 5.3 Clean up unused variables in component files
    - Remove unused variables from src/components/AddApiKeyForm.tsx, ApiKeySearch.tsx
    - Remove unused variables from src/components/SessionTimeoutSettings.tsx, ThemeToggle.tsx
    - _Requirements: 1.1, 1.3_

  - [ ] 5.4 Clean up unused imports in API routes and library files
    - Remove unused imports from API route files
    - Remove unused imports from src/lib/backup.ts, migration.ts, validation.ts
    - _Requirements: 1.1, 1.2_

- [ ] 6. Fix React Hook dependency warnings
  - [ ] 6.1 Fix useEffect dependencies in dashboard components
    - Fix missing dependencies in src/app/dashboard/feedback/page.tsx
    - Fix missing dependencies in src/components/DashboardContent.tsx, DashboardSidebar.tsx
    - _Requirements: 2.1, 2.2_

  - [ ] 6.2 Fix useEffect dependencies in API key components
    - Fix missing dependencies in src/components/ApiKeyList.tsx, ApiKeyViewDialog.tsx
    - Fix missing dependencies in src/components/DraggableApiKeyCard.tsx, MobileApiKeyCard.tsx
    - _Requirements: 2.1, 2.2_

  - [ ] 6.3 Fix useEffect dependencies in utility components
    - Fix missing dependencies in src/components/DataManagement.tsx
    - Fix missing dependencies in src/components/RotationReminderNotifications.tsx
    - _Requirements: 2.1, 2.2_

  - [ ] 6.4 Fix useEffect dependencies in drag and drop components
    - Fix missing dependencies in src/components/DroppableFolder.tsx, NoFolderDropZone.tsx
    - Fix missing dependencies in src/components/FolderDragAndDrop.tsx
    - _Requirements: 2.1, 2.2_

  - [ ] 6.5 Fix useEffect dependencies in context and navigation
    - Fix missing dependencies in src/contexts/VaultContext.tsx
    - Fix missing dependencies in src/components/SidebarNavigation.tsx
    - _Requirements: 2.1, 2.2_

- [ ] 7. Fix unescaped JSX entities
  - [ ] 7.1 Fix unescaped entities in marketing components
    - Fix apostrophes and quotes in src/components/FAQ.tsx
    - Fix apostrophes and quotes in src/components/PerfectFor.tsx
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 7.2 Fix unescaped entities in form components
    - Fix apostrophes in src/components/AddApiKeyForm.tsx
    - Fix apostrophes in src/components/ApiKeyList.tsx
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 7.3 Fix unescaped entities in settings components
    - Fix apostrophes in src/components/RotationReminderSettings.tsx
    - Fix apostrophes in src/components/ValueProposition.tsx
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8. Replace img tags with Next.js Image components
  - [ ] 8.1 Replace img tags in authentication pages
    - Replace img tags in src/app/sign-in/[[...sign-in]]/loading.tsx and page.tsx
    - Replace img tags in src/app/sign-up/[[...sign-up]]/loading.tsx and page.tsx
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 8.2 Replace img tags in navigation and hero components
    - Replace img tag in src/components/Hero.tsx
    - Replace img tag in src/components/Navbar.tsx
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 9. Fix variable declaration warnings
  - [ ] 9.1 Fix const vs let declarations in animation components
    - Fix timerInterval declaration in src/components/OldWayCardAnimated.tsx
    - Fix timerInterval declaration in src/components/ZKKeynestWayCardAnimated.tsx
    - _Requirements: 6.1, 6.2_

  - [ ] 9.2 Fix unused variable assignments in components
    - Fix cycleCount variable in src/components/ZKKeynestWayCardAnimated.tsx
    - Fix other unused variable assignments identified by linter
    - _Requirements: 6.1, 6.2_

- [ ] 10. Validate and test all fixes
  - Run ESLint to verify all errors are resolved
  - Run TypeScript compilation to ensure no type errors
  - Test application functionality to ensure no breaking changes
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_