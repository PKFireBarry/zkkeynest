# zKkeynest UI Mockup & User Flow

## Dashboard Layout

### Main Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header: zKkeynest | Search | Profile Menu | Upgrade Button     │
├─────────────────────────────────────────────────────────────┤
│ Sidebar:                                                  │
│ ├─ Dashboard                                             │
│ ├─ API Keys                                              │
│ ├─ Shared Keys                                           │
│ ├─ Settings                                              │
│ └─ Billing                                               │
├─────────────────────────────────────────────────────────────┤
│ Main Content:                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Welcome back, [Name]!                                 │ │
│ │ You have 3/10 API keys stored                        │ │
│ │                                                       │ │
│ │ [+ Add New API Key]                                   │ │
│ │                                                       │ │
│ │ Recent API Keys:                                      │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│ │ │ OpenAI API  │ │ GitHub PAT  │ │ Stripe Key  │      │ │
│ │ │ gpt-4-...   │ │ ghp_abc...  │ │ sk_live_... │      │ │
│ │ │ [View] [Edit]│ │ [View] [Edit]│ │ [View] [Edit]│      │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### API Key Card Design
```
┌─────────────────────────────────────────────────────────────┐
│ 🔑 OpenAI API Key                    [••••••••••••••••]  │
│ 📧 john@example.com                   [View] [Edit] [Share]│
│ 🏷️  AI Development                    [Copy] [Delete]      │
│ 📝 Used for GPT-4 API access                             │
│ ⏰ Created: 2 days ago                                   │
└─────────────────────────────────────────────────────────────┘
```

## User Flow Diagrams

### 1. Initial Login Flow
```
User visits site
    ↓
[Login with Google] or [Login with GitHub]
    ↓
Firebase Auth redirects to OAuth provider
    ↓
User authorizes and returns
    ↓
Check if user has master password
    ↓
If NO → Master Password Setup
If YES → Master Password Unlock
```

### 2. Master Password Setup
```
┌─────────────────────────────────────────────────────────────┐
│ 🔐 Set Up Your Master Password                           │
│                                                           │
│ This password will encrypt all your API keys.            │
│ We cannot recover it if you forget it.                   │
│                                                           │
│ Master Password:                                         │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••••••••••••••••••••••••• │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ Confirm Password:                                        │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••••••••••••••••••••••••• │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [Create Master Password]                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3. Master Password Unlock
```
┌─────────────────────────────────────────────────────────────┐
│ 🔓 Unlock Your Vault                                     │
│                                                           │
│ Enter your master password to access your API keys.      │
│                                                           │
│ Master Password:                                         │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••••••••••••••••••••••••• │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [Unlock Vault]                                           │
│                                                           │
│ Forgot password? [Reset Vault]                           │
└─────────────────────────────────────────────────────────────┘
```

### 4. Add New API Key Flow
```
Click [+ Add New API Key]
    ↓
┌─────────────────────────────────────────────────────────────┐
│ ➕ Add New API Key                                       │
│                                                           │
│ Label: [OpenAI API Key                    ]              │
│ Service: [OpenAI                    ▼]                   │
│ Email: [john@example.com              ]                   │
│ API Key: [sk-1234567890abcdef...      ]                  │
│ Notes: [Used for GPT-4 API access...  ]                  │
│                                                           │
│ [Save API Key] [Cancel]                                  │
└─────────────────────────────────────────────────────────────┘
    ↓
Enter master password to encrypt
    ↓
Key encrypted and stored
    ↓
Success notification
```

### 5. View API Key Flow
```
Click [View] on API key card
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 🔑 OpenAI API Key                                        │
│                                                           │
│ API Key:                                                 │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ sk-1234567890abcdef1234567890abcdef1234567890    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [Copy] [Hide] [Close]                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6. Share API Key Flow
```
Click [Share] on API key card
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 🔗 Share API Key                                         │
│                                                           │
│ This will create a secure, one-time use link.            │
│ The link will expire after use or in 24 hours.           │
│                                                           │
│ Optional PIN (for extra security):                       │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 1234                                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [Generate Share Link] [Cancel]                           │
└─────────────────────────────────────────────────────────────┘
    ↓
Link generated and copied to clipboard
    ↓
Share link via email, Slack, etc.
```

### 7. Shared Link Access Flow
```
Recipient clicks shared link
    ↓
┌─────────────────────────────────────────────────────────────┐
│ 🔗 Secure API Key Share                                  │
│                                                           │
│ You've been sent a secure API key.                       │
│ This link can only be used once.                         │
│                                                           │
│ Enter PIN (if required):                                 │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 1234                                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ [View API Key]                                            │
└─────────────────────────────────────────────────────────────┘
    ↓
API key displayed once
    ↓
Link becomes invalid
```

## Responsive Design

### Mobile Layout
```
┌─────────────────────────────────────────┐
│ [Menu] zKkeynest [Profile]               │
├─────────────────────────────────────────┤
│ Welcome back!                          │
│ 3/10 API keys stored                  │
│                                       │
│ [+ Add New API Key]                   │
│                                       │
│ Recent Keys:                          │
│ ┌─────────────────────────────────────┐ │
│ │ OpenAI API                         │ │
│ │ gpt-4-... [View] [Edit] [Share]   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ GitHub PAT                         │ │
│ │ ghp_abc... [View] [Edit] [Share]  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Tablet Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | Search | Profile                       │
├─────────────────────────────────────────────────────────┤
│ Sidebar (collapsible):                                │
│ ├─ Dashboard                                          │
│ ├─ API Keys                                           │
│ └─ Settings                                           │
├─────────────────────────────────────────────────────────┤
│ Main Content (same as desktop)                        │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme & Design System

### Primary Colors
- **Primary Blue**: `#2563eb` (for buttons, links)
- **Success Green**: `#16a34a` (for success states)
- **Warning Orange**: `#ea580c` (for warnings)
- **Error Red**: `#dc2626` (for errors)
- **Background**: `#ffffff` (light) / `#0f172a` (dark)
- **Surface**: `#f8fafc` (light) / `#1e293b` (dark)

### Typography
- **Headings**: Inter, 600 weight
- **Body**: Inter, 400 weight
- **Monospace**: JetBrains Mono (for API keys)

### Components
- **Cards**: Rounded corners (8px), subtle shadow
- **Buttons**: Primary (blue), Secondary (gray), Danger (red)
- **Inputs**: Clean borders, focus states
- **Modals**: Backdrop blur, centered content

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual layout
- Escape key closes modals
- Enter/Space activates buttons
- Arrow keys for dropdowns

### Screen Reader Support
- Proper ARIA labels
- Semantic HTML structure
- Focus indicators
- Alt text for icons

### Visual Accessibility
- High contrast mode
- Large text support
- Color-blind friendly palette
- Clear focus indicators 