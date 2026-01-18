# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working on the Helldivers 2 Companion codebase. Last updated: 2026-01-18.

## Project Overview

**Name**: Helldivers 2 Companion
**Version**: 2.0.0
**Type**: Next.js Progressive Web Application
**Purpose**: Real-time companion app for Helldivers 2 game data tracking

### Features
- Real-time war status and galactic progress tracking
- Active planet liberation campaigns with interactive map
- Major Order (assignments) tracking with progress indicators
- Game dispatches and Steam news feed
- War statistics and player metrics
- Progressive Web App with installable mobile experience

## Technology Stack

### Core Framework
- **Next.js 16.0.10**: React framework with App Router
- **React 19.2.3**: UI library with Server Components
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Node.js**: Runtime environment

### Styling & UI
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **shadcn/ui**: Component library (new-york style)
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **next-themes**: Dark mode support

### Data & APIs
- **Helldivers 2 API** (`https://api.helldivers2.dev/api`): Primary data source
- **date-fns**: Date manipulation
- **millify**: Number abbreviation

### Maps & Visualization
- **Leaflet**: Interactive map library
- **react-leaflet**: React wrapper for Leaflet

### Development Tools
- **pnpm**: Package manager (preferred)
- **ESLint**: Code linting
- **Prettier**: Code formatting with Tailwind plugin
- **Turbopack**: Fast development bundler

### Analytics & Engagement
- **Vercel Analytics**: Usage tracking
- **Vercel Speed Insights**: Performance monitoring
- **Giscus**: GitHub Discussions-based comments

## Codebase Structure

```
/home/user/companion-v2/
├── app/                      # Next.js App Router (pages & routes)
│   ├── faq/                 # FAQ page route
│   ├── news/                # News page route
│   ├── statistics/          # Statistics page route
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (Status page)
│   ├── globals.css          # Global styles, Tailwind imports, CSS variables
│   └── manifest.json        # PWA manifest configuration
│
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components (Button, Card, etc.)
│   ├── widgets/             # Feature-specific widgets
│   │   ├── root/           # Homepage widgets (major-order, campaigns, map, dispatches)
│   │   ├── news/           # News page widgets (newsfeed, wiki)
│   │   └── statistics/     # Statistics widgets
│   ├── header.tsx          # Navigation header (client component)
│   ├── footer.tsx          # Site footer
│   ├── container.tsx       # Page container wrapper
│   ├── dashboard-card.tsx  # Card wrapper for widgets
│   ├── comments.tsx        # Giscus comments integration
│   └── theme-provider.tsx  # Dark mode provider
│
├── lib/                     # Utility functions and API logic
│   ├── get.ts              # Core API fetching utility (getAPI function)
│   ├── get-campaigns.tsx   # Campaign-specific data fetching & processing
│   └── utils.ts            # Tailwind utility merger (cn function)
│
├── types/                   # TypeScript type definitions
│   ├── assignments.ts      # Major Order types
│   └── campaigns.ts        # Campaign, Planet, and Event types
│
├── config/                  # Configuration
│   └── site.ts             # Site metadata, API headers, navigation
│
├── public/                  # Static assets
│   ├── factions/           # Faction icons (Automatons, Terminids, Illuminate, Humans)
│   ├── sectormap.webp      # Galaxy map background image
│   └── [icons]             # PWA icons (various sizes)
│
└── [config files]          # next.config.ts, tsconfig.json, eslint.config.mjs, etc.
```

## Development Workflow

### Setup
```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server (with Turbopack)
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Run linter
pnpm run lint
```

### Development Server
- Local URL: `http://localhost:3000`
- Hot reload enabled via Turbopack
- Server Components render on server by default
- Client Components marked with `"use client"` directive

## Architectural Patterns

### 1. Next.js App Router Architecture

**Server Components (Default)**
- Used for data fetching and static content
- No JavaScript sent to client for these components
- Async functions supported for data fetching
- Examples: `MajorOrder`, `CampaignTable`, `Dispatches`, `Statistics`

**Client Components** (marked with `"use client"`)
- Used for interactivity (state, effects, event handlers)
- Required for browser APIs and hooks
- Examples: `Header`, `CampaignMap`, `ThemeProvider`, `Comments`

**File-Based Routing**
- Routes defined by folder structure in `/app`
- `page.tsx` = route component
- `layout.tsx` = shared layout wrapper
- `loading.tsx` = loading UI (if needed)
- `error.tsx` = error boundary (if needed)

### 2. Component Architecture

**Container Pattern**
```tsx
<Container>
  {/* Page content with consistent max-width and padding */}
</Container>
```

**Dashboard Card Pattern**
```tsx
<DashboardCard
  title="Widget Title"
  description="Widget description"
  icon={<Icon />}
  footer={<FooterContent />}
>
  {/* Widget content */}
</DashboardCard>
```

**Widget Pattern**
- Self-contained feature components
- Fetch their own data (Server Components)
- Handle their own error states
- Organized by page in `/components/widgets/[page]/`

**Layout Hierarchy**
```
app/layout.tsx (root)
  ├── Header (navigation)
  ├── main
  │   └── Container
  │       └── page content
  │           └── DashboardCard(s)
  │               └── Widget(s)
  │                   └── UI Component(s)
  ├── Footer
  └── Analytics/Insights
```

### 3. Data Fetching Strategy

**Server-Side Data Fetching** (Preferred)
```typescript
// In Server Component
export default async function MyWidget() {
  const data = await getAPI({
    url: "/v1/endpoint",
    revalidate: 3600, // ISR revalidation in seconds
    timeout: 10000,   // Request timeout in milliseconds
  });

  return <div>{/* render data */}</div>;
}
```

**Incremental Static Regeneration (ISR)**
- Pages are statically generated at build time
- Data revalidated at specified intervals
- Fresh data served without rebuilding entire app

**Revalidation Times** (defined in `/lib/get.ts`):
```typescript
REVALIDATION_TIMES = {
  NEWSFEED: 300,      // 5 minutes
  DISPATCHES: 600,    // 10 minutes
  MAJOR_ORDER: 900,   // 15 minutes
  STATISTICS: 1800,   // 30 minutes
  CAMPAIGNS: 3600,    // 1 hour
}
```

**Client-Side Data Fetching** (Avoid unless necessary)
- Only use for highly interactive components
- Example: Map component with user interactions

**Dynamic Imports for Heavy Components**
```typescript
const CampaignMap = dynamic(
  () => import("@/components/widgets/root/campaign-map"),
  {
    loading: () => <Skeleton className="h-[400px]" />,
    ssr: false // Disable SSR for client-only components
  }
);
```

### 4. API Integration

**Core API Function** (`/lib/get.ts`)
```typescript
export async function getAPI({
  url,
  revalidate = 3600,
  timeout = 10000,
}): Promise<any>
```

**Features:**
- Base API URL: `https://api.helldivers2.dev/api`
- Custom headers from `/config/site.ts`
- Timeout handling with AbortController
- Automatic ISR integration
- Comprehensive error handling

**API Endpoints:**
- `/v1/assignments` - Major Orders (missions)
- `/v1/campaigns` - Active planet campaigns
- `/v2/dispatches` - In-game dispatches/news
- `/v1/steam` - Steam news feed
- `/v1/war` - War statistics and metrics

**Error Handling Pattern:**
```typescript
try {
  const data = await getAPI({ url: "/v1/endpoint" });
  if (!data) return <EmptyState />;
  return <DataDisplay data={data} />;
} catch (error) {
  console.error("Error fetching data:", error);
  return <ErrorState />;
}
```

## Styling Guidelines

### Tailwind CSS v4

**Import in globals.css:**
```css
@import "tailwindcss";
```

**Theme Configuration:**
- Inline theme using `@theme` directive in `globals.css`
- CSS variables for all colors (OKLCH color space)
- Dark mode support via `.dark` class
- Custom utilities: `.glass-ui`, `.border`, `.website`

**Class Merging Helper:**
```typescript
import { cn } from "@/lib/utils";

<div className={cn("base-classes", conditionalClasses)} />
```

**Color System:**
- Uses OKLCH color space for better perceptual uniformity
- CSS variables: `--color-background`, `--color-foreground`, etc.
- Dark mode variants automatically applied

**Design Patterns:**
- **Glass Morphism**: `.glass-ui` class for translucent backgrounds
- **Responsive**: Mobile-first approach
- **Animations**: Use Tailwind's built-in transitions or `tw-animate-css`
- **Icons**: Lucide React components

**shadcn/ui Components:**
- Pre-built accessible components in `/components/ui/`
- Customizable via Tailwind classes
- Variant management with `class-variance-authority`

## TypeScript Conventions

### Configuration
- **Strict mode**: Enabled
- **Path aliases**: `@/*` maps to project root
- **Target**: ES2017
- **Module resolution**: bundler

### Type Definitions

**Location**: `/types/` directory

**Key Interfaces:**

```typescript
// Assignments (Major Orders)
interface Assignment {
  id: string | number;
  briefing: string;
  description: string;
  expiration: string;
  progress: number[];
  setting?: {
    taskDescription: string;
    overrideTitle?: string;
  };
  rewards?: Reward[];
}

// Campaigns & Planets
interface Campaign {
  id?: string | number;
  planet: Planet;
  faction: string;
}

interface Planet {
  name: string;
  sector: string;
  position: PlanetPosition;
  health: number;
  maxHealth: number;
  statistics: PlanetStatistics;
  event?: PlanetEvent | null;
}
```

**Type Safety Patterns:**
- Always define interfaces for API responses
- Use `React.ComponentProps<typeof Component>` for component prop types
- Use `satisfies` keyword for type checking constants
- Prefer interfaces over types for objects
- Use generics for reusable utilities

### Component Props Pattern
```typescript
interface WidgetProps {
  data: SomeType;
  className?: string;
  onAction?: () => void;
}

export default function Widget({ data, className, onAction }: WidgetProps) {
  // Component implementation
}
```

## File Naming Conventions

### General Rules
- **Pages**: PascalCase with descriptive names (e.g., `NewsPage`, `StatisticsPage`)
- **Components**: PascalCase (e.g., `MajorOrder`, `CampaignTable`)
- **Files**: kebab-case for multi-word files (e.g., `campaign-map.tsx`, `major-order.tsx`)
- **Utilities**: camelCase functions (e.g., `getAPI`, `getCampaignStats`)
- **Types**: kebab-case files, PascalCase interfaces (e.g., `assignments.ts` contains `Assignment` interface)
- **Config**: kebab-case (e.g., `next.config.ts`, `site.ts`)

### Component File Structure
```typescript
// 1. Imports
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
export default function Component({ }: Props) {
  // ...
}

// 4. Helper functions (if any)
function helperFunction() {
  // ...
}
```

### Directory Organization
- **UI Components**: `/components/ui/` (shadcn/ui library)
- **Feature Widgets**: `/components/widgets/[page]/` (page-specific)
- **Shared Components**: `/components/` (root level)
- **Utilities**: `/lib/`
- **Types**: `/types/`
- **Configuration**: `/config/`

## Common Development Tasks

### Adding a New Page

1. **Create route folder and page:**
   ```typescript
   // app/my-page/page.tsx
   import type { Metadata } from "next";
   import Container from "@/components/container";

   export const metadata: Metadata = {
     title: "My Page",
     description: "Page description for SEO",
   };

   export default function MyPage() {
     return (
       <Container>
         {/* Page content */}
       </Container>
     );
   }
   ```

2. **Add navigation link:**
   ```typescript
   // config/site.ts
   export const siteConfig = {
     navItems: [
       // ... existing items
       {
         title: "My Page",
         href: "/my-page",
         icon: MyIcon, // Lucide icon
       },
     ],
   };
   ```

### Adding a New Widget

1. **Create widget component:**
   ```typescript
   // components/widgets/[page]/my-widget.tsx
   import DashboardCard from "@/components/dashboard-card";
   import { getAPI } from "@/lib/get";
   import { MyIcon } from "lucide-react";

   export default async function MyWidget() {
     const data = await getAPI({
       url: "/v1/endpoint",
       revalidate: 3600,
     });

     return (
       <DashboardCard
         title="Widget Title"
         description="Widget description"
         icon={<MyIcon />}
       >
         {/* Widget content */}
       </DashboardCard>
     );
   }
   ```

2. **Import in page:**
   ```typescript
   import MyWidget from "@/components/widgets/[page]/my-widget";

   export default function Page() {
     return (
       <Container>
         <MyWidget />
       </Container>
     );
   }
   ```

### Adding a New UI Component (shadcn/ui)

```bash
# Use npx to add shadcn components
npx shadcn@latest add [component-name]

# Example
npx shadcn@latest add dialog
```

Components are added to `/components/ui/` and can be customized.

### Creating a New Type Definition

```typescript
// types/my-feature.ts
export interface MyFeature {
  id: string | number;
  name: string;
  // ... other properties
}

export interface MyFeatureResponse {
  data: MyFeature[];
  meta?: {
    total: number;
  };
}
```

### Adding a New API Endpoint

1. **Use getAPI function:**
   ```typescript
   import { getAPI } from "@/lib/get";

   const data = await getAPI({
     url: "/v1/new-endpoint",
     revalidate: 1800, // 30 minutes
     timeout: 10000,   // 10 seconds
   });
   ```

2. **Define response types in `/types/`**

3. **Consider adding revalidation constant:**
   ```typescript
   // lib/get.ts
   export const REVALIDATION_TIMES = {
     // ... existing
     NEW_ENDPOINT: 1800,
   };
   ```

### Creating a Client Component

```typescript
"use client"; // Add directive at top

import { useState, useEffect } from "react";

export default function MyClientComponent() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Client-side effects
  }, []);

  return (
    <div onClick={() => setState(/* ... */)}>
      {/* Interactive content */}
    </div>
  );
}
```

### Adding Custom Styling

**Option 1: Tailwind Classes (Preferred)**
```tsx
<div className="rounded-lg bg-card p-4 shadow-sm">
  {/* Content */}
</div>
```

**Option 2: CSS Variables**
```css
/* app/globals.css */
@theme {
  --color-my-custom: oklch(0.5 0.2 250);
}
```

```tsx
<div className="text-[--color-my-custom]">
  {/* Content */}
</div>
```

**Option 3: Custom Utility Class**
```css
/* app/globals.css */
@layer utilities {
  .my-utility {
    @apply rounded-lg bg-gradient-to-r from-blue-500 to-purple-500;
  }
}
```

## Key Conventions for AI Assistants

### Code Quality Standards

1. **TypeScript First**
   - Always use TypeScript, never plain JavaScript
   - Define types/interfaces for all data structures
   - Avoid `any` type unless absolutely necessary
   - Use proper return types for functions

2. **Server Components by Default**
   - Use Server Components unless interactivity is required
   - Add `"use client"` only when necessary
   - Prefer server-side data fetching with ISR

3. **Error Handling**
   - Always wrap API calls in try-catch blocks
   - Provide graceful fallbacks for missing data
   - Log errors with descriptive messages
   - Show user-friendly error states

4. **Performance Optimization**
   - Use dynamic imports for heavy components
   - Implement proper ISR revalidation times
   - Minimize client-side JavaScript
   - Optimize images with Next.js Image component

5. **Accessibility**
   - Use semantic HTML elements
   - Include ARIA labels for interactive elements
   - Support keyboard navigation
   - Provide screen reader text with `sr-only`

6. **Code Organization**
   - Keep components small and focused
   - Extract reusable logic to utility functions
   - Group related code by feature, not type
   - Follow the established directory structure

### Don't Do This (Anti-Patterns)

❌ **Don't create new files unnecessarily**
- Always prefer editing existing files
- Check for similar components before creating new ones
- Reuse existing utilities and patterns

❌ **Don't use inline styles**
- Use Tailwind classes exclusively
- Define custom utilities in `globals.css` if needed

❌ **Don't fetch data client-side**
- Use Server Components with ISR
- Client-side fetching only for user interactions

❌ **Don't ignore TypeScript errors**
- Fix type errors immediately
- Don't use `@ts-ignore` unless absolutely necessary

❌ **Don't hardcode values**
- Use constants from `/config/site.ts`
- Define magic numbers as named constants

❌ **Don't over-engineer**
- Keep solutions simple and focused
- Don't add features beyond what's requested
- Avoid premature optimization

❌ **Don't skip error handling**
- Every API call needs error handling
- Provide user feedback for failures

❌ **Don't mix styling approaches**
- Stick to Tailwind CSS
- Don't add CSS modules or styled-components

### Do This (Best Practices)

✅ **Use existing patterns**
- Follow the DashboardCard wrapper pattern
- Use the Container component for page layouts
- Implement error boundaries where appropriate

✅ **Leverage Server Components**
- Fetch data server-side with async/await
- Use ISR with appropriate revalidation times
- Keep client components minimal

✅ **Write maintainable code**
- Clear, descriptive variable names
- Comments for complex logic only
- Consistent formatting with Prettier

✅ **Optimize for performance**
- Dynamic imports for client components
- Proper image optimization
- Efficient data fetching strategies

✅ **Follow TypeScript conventions**
- Define interfaces in `/types/`
- Use type inference where possible
- Proper generic types for utilities

✅ **Test thoroughly**
- Check responsive design (mobile, tablet, desktop)
- Verify dark mode compatibility
- Test PWA functionality
- Ensure data updates with revalidation

### When Making Changes

1. **Read Before Modifying**
   - Always read files before editing
   - Understand existing patterns and conventions
   - Check for similar implementations

2. **Preserve Existing Functionality**
   - Don't break existing features
   - Test related components after changes
   - Maintain backward compatibility

3. **Keep Changes Focused**
   - One feature/fix per change
   - Don't refactor unrelated code
   - Avoid scope creep

4. **Update Types**
   - Add/update TypeScript types for new data
   - Ensure type safety throughout

5. **Consider Mobile**
   - All features must work on mobile
   - Test responsive breakpoints
   - PWA compatibility

6. **Document Complex Logic**
   - Add comments for non-obvious code
   - Update this CLAUDE.md if patterns change
   - Document API changes

### Debugging Tips

**Common Issues:**
- **Hydration errors**: Check for client/server mismatches
- **Type errors**: Verify API response matches type definitions
- **Styling issues**: Use browser DevTools, check dark mode
- **Data not updating**: Verify ISR revalidation times
- **Map not loading**: Check dynamic import and SSR settings

**Development Tools:**
- Browser DevTools for client debugging
- Next.js error overlay for build errors
- ESLint for code quality
- TypeScript compiler for type checking

### Git Workflow

**Branch Naming:**
- Feature: `claude/add-[feature-name]-[session-id]`
- Fix: `claude/fix-[issue]-[session-id]`
- Example: `claude/add-player-stats-wqMn9`

**Commit Messages:**
- Format: `type: description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`
- Be descriptive but concise
- Examples:
  - `feat: add player statistics widget`
  - `fix: correct liberation percentage calculation`
  - `refactor: improve campaign data fetching`

**Push Commands:**
```bash
# Always use -u flag for new branches
git push -u origin claude/[branch-name]-[session-id]

# Session ID must match the branch suffix
```

## API Reference

### Primary API Endpoints

**Base URL**: `https://api.helldivers2.dev/api`

| Endpoint | Description | Revalidation | Data Type |
|----------|-------------|--------------|-----------|
| `/v1/assignments` | Major Orders (active missions) | 15 min | Assignment[] |
| `/v1/campaigns` | Active planet campaigns | 1 hour | Campaign[] |
| `/v2/dispatches` | In-game dispatches/news | 10 min | Dispatch[] |
| `/v1/steam` | Steam news feed | 5 min | SteamNews[] |
| `/v1/war` | War statistics | 30 min | WarStats |

### Custom Headers (from `/config/site.ts`)

```typescript
{
  "X-Super-Client": "companion-v2",
  "X-Super-Contact": "[contact-email]"
}
```

### Rate Limiting
- No explicit rate limits documented
- Use ISR to minimize API calls
- Respect revalidation times

## PWA Configuration

**Manifest**: `/app/manifest.json`
- App name: "Helldivers Companion"
- Display mode: `standalone`
- Icons: Multiple sizes for iOS and Android

**Features:**
- Installable on mobile devices
- Offline-capable with ISR caching
- Home screen icon support
- iOS-specific meta tags in layout

## Environment & Deployment

**Target Platform**: Vercel (optimized for)

**Environment Variables**: None currently used (API is public)

**Build Commands:**
```bash
pnpm run build  # Production build
pnpm start      # Production server
```

**Deployment:**
- Automatic deployment via Vercel
- ISR works out of the box
- Edge runtime supported

## Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)

### API Documentation
- [Helldivers 2 API](https://api.helldivers2.dev/)

### Tools
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)
- [Leaflet](https://leafletjs.com/)

## Summary

This Helldivers 2 Companion app is a modern Next.js application leveraging:
- **Server Components** for optimal performance
- **ISR** for fresh data without constant rebuilding
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling
- **shadcn/ui** for accessible components
- **PWA** features for mobile experience

When working on this codebase:
1. Use Server Components by default
2. Follow established patterns (Container, DashboardCard, Widget)
3. Maintain type safety with TypeScript
4. Use Tailwind for all styling
5. Implement proper error handling
6. Respect ISR revalidation times
7. Keep mobile/PWA compatibility in mind
8. Test dark mode and responsive layouts

This codebase prioritizes simplicity, performance, and maintainability. Follow the patterns, avoid over-engineering, and keep changes focused.
