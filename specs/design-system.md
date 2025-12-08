# Interview Buddy - Design System & Visual Design

**Version**: 1.0.0  
**Last Updated**: 2025-12-08  
**Status**: 🎨 Design Foundation

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color Palette](#color-palette)
4. [Component Framework](#component-framework)
5. [Visual Inspiration](#visual-inspiration)
6. [Typography](#typography)
7. [Spacing & Layout](#spacing--layout)
8. [Component Patterns](#component-patterns)
9. [Accessibility](#accessibility)
10. [Implementation Guide](#implementation-guide)

---

## Overview

Interview Buddy has **two distinct visual experiences**:

1. **Recording Window** - Nearly invisible, minimal UI for discreet recording
2. **Dashboard & Analysis** - Rich, data-dense interface for desktop and mobile

This design system balances these contrasting needs while maintaining a cohesive brand identity.

---

## Design Philosophy

### Core Principles

**1. Invisible When Needed**  
The recording window should fade into the background, allowing users to focus on their interview without distraction.

**2. Insightful When Exploring**  
The dashboard should surface meaningful patterns and actionable insights through clear data visualization.

**3. Trust Through Clarity**  
Users are sharing sensitive interview recordings. Every interaction should reinforce security and privacy.

**4. Performance First**  
Fast load times and smooth interactions signal quality and respect for the user's time.

**5. Accessible to All**  
Everyone deserves to improve their interview skills, regardless of ability or device.

---

## Color Palette

### Primary Colors

Our palette draws inspiration from professional tools (Notion, Linear, Figma) with a calm, trustworthy feel:

```css
/* Primary Brand Colors */
--color-primary-50: #f0f4ff;      /* Lightest blue - backgrounds */
--color-primary-100: #dce5ff;     /* Very light blue - hover states */
--color-primary-200: #bfcfff;     /* Light blue - borders */
--color-primary-300: #91b0ff;     /* Medium blue - inactive elements */
--color-primary-400: #5b8bff;     /* Bright blue - focus states */
--color-primary-500: #3b6fff;     /* Core brand blue - primary actions */
--color-primary-600: #2855e0;     /* Deep blue - primary hover */
--color-primary-700: #1e42b5;     /* Darker blue - pressed states */
--color-primary-800: #1d3a92;     /* Very dark blue - text on light bg */
--color-primary-900: #1d3576;     /* Darkest blue - headings */
--color-primary-950: #151f47;     /* Almost black blue - contrast */
```

**Usage:**
- `primary-500`: Primary buttons, links, active states
- `primary-600`: Hover states for primary actions
- `primary-50/100`: Subtle backgrounds, highlights
- `primary-700/800`: Text on light backgrounds

### Neutral Colors

```css
/* Neutral Grays */
--color-neutral-50: #fafafa;      /* Off-white backgrounds */
--color-neutral-100: #f4f4f5;     /* Light gray - cards */
--color-neutral-200: #e4e4e7;     /* Borders, dividers */
--color-neutral-300: #d4d4d8;     /* Inactive borders */
--color-neutral-400: #a1a1aa;     /* Placeholder text */
--color-neutral-500: #71717a;     /* Secondary text */
--color-neutral-600: #52525b;     /* Body text (light mode) */
--color-neutral-700: #3f3f46;     /* Headings (light mode) */
--color-neutral-800: #27272a;     /* High contrast text */
--color-neutral-900: #18181b;     /* Near black */
--color-neutral-950: #09090b;     /* True black */
```

### Semantic Colors

```css
/* Success - Green */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;     /* Analysis complete, positive insights */
--color-success-600: #16a34a;
--color-success-700: #15803d;

/* Warning - Amber */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;     /* Processing status, caution alerts */
--color-warning-600: #d97706;
--color-warning-700: #b45309;

/* Error - Red */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;       /* Upload failed, critical issues */
--color-error-600: #dc2626;
--color-error-700: #b91c1c;

/* Info - Blue (slightly different hue from primary) */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;        /* Tips, informational notices */
--color-info-600: #2563eb;
--color-info-700: #1d4ed8;
```

### Recording Window Specific

For the nearly-invisible recording window:

```css
/* Ultra Minimal Palette */
--recording-bg: rgba(0, 0, 0, 0.02);          /* Barely visible background */
--recording-bg-hover: rgba(0, 0, 0, 0.06);    /* Subtle hover */
--recording-text: rgba(0, 0, 0, 0.3);         /* Low contrast text */
--recording-text-hover: rgba(0, 0, 0, 0.6);   /* Reveal on hover */
--recording-accent: #3b6fff;                   /* Only for critical actions */
--recording-danger: #ef4444;                   /* Stop recording */
```

### Dark Mode

Full dark mode support (auto-detected via `prefers-color-scheme`):

```css
/* Dark Mode Adjustments */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-500: #5b8bff;     /* Slightly brighter for dark bg */
    
    /* Inverted neutrals */
    --color-neutral-50: #18181b;
    --color-neutral-100: #27272a;
    --color-neutral-200: #3f3f46;
    --color-neutral-600: #d4d4d8;
    --color-neutral-700: #e4e4e7;
    --color-neutral-800: #f4f4f5;
    --color-neutral-900: #fafafa;
    
    /* Recording window in dark mode */
    --recording-bg: rgba(255, 255, 255, 0.02);
    --recording-bg-hover: rgba(255, 255, 255, 0.06);
    --recording-text: rgba(255, 255, 255, 0.3);
    --recording-text-hover: rgba(255, 255, 255, 0.6);
  }
}
```

---

## Component Framework

### Recommendation: **shadcn/ui** with Radix Primitives

**Why shadcn/ui?**

✅ **Copy-paste, not package dependency** - Components live in your codebase, full control  
✅ **Built on Radix UI** - Best-in-class accessibility primitives  
✅ **Tailwind CSS native** - Perfect fit with our Tailwind v4 setup  
✅ **TypeScript first** - Type-safe components out of the box  
✅ **Customizable** - Not a design system, it's a component library you own  
✅ **No runtime overhead** - Just React components, no library bundle  

### shadcn/ui Setup

```bash
# Install shadcn/ui CLI
npx shadcn@latest init

# Add components as needed (example)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add progress
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add tooltip
```

Components will be added to `apps/web/components/ui/` and are fully editable.

### Key Components for Interview Buddy

| Component | Use Case | Priority |
|-----------|----------|----------|
| **Button** | Primary actions, navigation | P1 |
| **Card** | Interview cards, metric displays | P1 |
| **Progress** | Upload progress, processing status | P1 |
| **Badge** | Status indicators (analyzing, complete) | P1 |
| **Dialog** | Delete confirmation, error modals | P1 |
| **Toast** | Success/error notifications | P1 |
| **Tooltip** | Contextual help, metric explanations | P1 |
| **Select** | Interview type, company selection | P1 |
| **Input** | Metadata forms, search | P1 |
| **Textarea** | Notes, job description input | P1 |
| **Tabs** | Analysis sections (speech, content, sentiment) | P1 |
| **Accordion** | Collapsible recommendations, transcript | P2 |
| **Chart** | Sentiment timeline, performance trends | P2 |
| **Dropdown Menu** | Interview actions (edit, delete, export) | P2 |

### Alternative: Radix UI Directly

If you prefer to build components from scratch:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress
```

Use Radix primitives as building blocks, style with Tailwind.

**Recommendation**: Start with shadcn/ui for speed, customize as needed.

---

## Visual Inspiration

### 1. Recording Window

**Inspiration: macOS Screen Recording Indicator**

![Concept: Ultra-minimal recording bar]

- **Size**: 140px × 32px (compact)
- **Position**: Top-right corner, always on top
- **Opacity**: 30% by default, 100% on hover
- **Animation**: Subtle pulse on recording icon
- **Drag**: Draggable to any screen edge

**Similar Apps:**
- [Loom Desktop](https://www.loom.com/) - Minimal recording controls
- [CleanShot X](https://cleanshot.com/) - Floating toolbar pattern
- macOS Screenshot toolbar - System-native feel

**Key Features:**
```
┌─────────────────────┐
│ 🔴 02:34  ⏸ ⏹ ⚙️  │  <- Ultra compact
└─────────────────────┘
  ↑     ↑    ↑  ↑  ↑
  Recording  Pause/Stop/Settings
  (pulsing)  (hover to reveal)
```

### 2. Dashboard - Main Interview List

**Inspiration: Linear Issues, Notion Databases**

![Concept: Clean, scannable list with status]

**Similar Apps:**
- [Linear](https://linear.app/) - Clean issue list, subtle colors, fast filtering
- [Notion Databases](https://notion.so/) - Flexible views (table, grid, timeline)
- [Height](https://height.app/) - Project management with beautiful status indicators

**Key Features:**
- **Card-based layout** on desktop (3 columns)
- **List view** on mobile (stack)
- **Quick actions** on hover (edit, view, delete)
- **Status badges** with color coding
- **Smart sorting** (most recent, in progress, completed)

```
┌────────────────────────────────────────────────────────┐
│  📊 Your Interviews (12)          [+ New Upload]       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ ✅ Complete│  │ 🔄 Analyzing│  │ 📤 Uploaded │      │
│  │ Amazon     │  │ Google     │  │ Microsoft  │      │
│  │ SWE II     │  │ PM L4      │  │ Data Sci   │      │
│  │ 42 mins    │  │ 28 mins    │  │ 15 mins    │      │
│  │            │  │            │  │            │      │
│  │ View →     │  │ ⏳ 3m left │  │ ⏳ 8m left │      │
│  └────────────┘  └────────────┘  └────────────┘      │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 3. Analysis Results Page

**Inspiration: Grammarly Insights, GitHub Copilot Analytics**

![Concept: Data-rich insights with clear hierarchy]

**Similar Apps:**
- [Grammarly](https://grammarly.com/) - Writing insights with scores and recommendations
- [GitHub Copilot Metrics](https://github.com/features/copilot) - Usage analytics
- [Stripe Dashboard](https://stripe.com/) - Clean data visualization

**Key Features:**
- **Hero score** at top (overall performance: 78/100)
- **Tabbed sections** (Speech | Content | Sentiment | Recommendations)
- **Inline metrics** with tooltips explaining each
- **Timeline visualization** for sentiment over time
- **Expandable transcript** with timestamps

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Interviews                                     │
│                                                            │
│  Amazon SWE II - Behavioral Round                         │
│  Oct 15, 2025 • 42 minutes • ✅ Analysis Complete        │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │            Overall Performance: 78/100              │  │
│  │  ████████████████████████░░░░░░░░░░░               │  │
│  │                                                      │  │
│  │  💬 Speech: 82  |  📝 Content: 76  |  😊 Tone: 75  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  [Speech Analysis] [Content Analysis] [Recommendations]   │
│  ─────────────────                                        │
│                                                            │
│  Filler Words                                             │
│  🟢 Low usage (12 instances)                              │
│  ├─ "um" × 7                                              │
│  ├─ "uh" × 3                                              │
│  └─ "like" × 2                                            │
│                                                            │
│  Speaking Pace                                            │
│  🟢 Optimal (142 WPM)                                     │
│  Target range: 130-160 WPM                                │
│                                                            │
│  Pauses                                                   │
│  🟡 Moderate (18 pauses > 3s)                             │
│  Consider shorter pauses for stronger confidence          │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 4. Upload Flow

**Inspiration: Dropbox Upload, WeTransfer**

![Concept: Delightful, reassuring upload experience]

**Similar Apps:**
- [WeTransfer](https://wetransfer.com/) - Beautiful upload progress
- [Dropbox](https://dropbox.com/) - Clear status, resume support
- [Cloudflare Images](https://cloudflare.com/) - Fast, professional upload

**Key Features:**
- **Drag-and-drop zone** with animation
- **Multiple file format support** (clear icons)
- **Live progress** with estimated time
- **Resume support** (mention if connection drops)

```
┌──────────────────────────────────────────────────────────┐
│  Upload Interview Recording                               │
│                                                            │
│  ╔════════════════════════════════════════════════════╗  │
│  ║                                                      ║  │
│  ║          📁  Drag & drop your recording here        ║  │
│  ║                                                      ║  │
│  ║              or click to browse files               ║  │
│  ║                                                      ║  │
│  ║    Supports: MP4, MOV, WebM, M4A, WAV (up to 2GB)  ║  │
│  ╚════════════════════════════════════════════════════╝  │
│                                                            │
│  While uploading, add interview details:                  │
│                                                            │
│  Company:      [Amazon                            ]       │
│  Job Title:    [Software Engineer II              ]       │
│  Interview Type: [Behavioral ▼]                           │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## Typography

### Font Families

**Recommendation: System Font Stack**

```css
/* Sans-serif - Body text */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", 
             "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", 
             "Helvetica Neue", sans-serif;

/* Monospace - Code, timestamps */
--font-mono: ui-monospace, "SF Mono", Monaco, "Cascadia Code", 
             "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace",
             "Source Code Pro", "Fira Mono", "Droid Sans Mono", 
             "Courier New", monospace;
```

**Why system fonts?**
- ⚡ Zero network request (instant load)
- 📱 Native feel on each platform
- 🎨 Respects user's OS preferences
- ♿ Best accessibility (users are familiar)

**Alternative (if you want a custom font):**  
Use [Geist Sans](https://vercel.com/font) (already included in Next.js template) or [Inter](https://rsms.me/inter/) for a modern, professional look.

### Type Scale

```css
/* Tailwind CSS type scale */
text-xs     /* 12px - Captions, helper text */
text-sm     /* 14px - Secondary text, labels */
text-base   /* 16px - Body text (default) */
text-lg     /* 18px - Emphasized body text */
text-xl     /* 20px - Section headings */
text-2xl    /* 24px - Card titles */
text-3xl    /* 30px - Page titles */
text-4xl    /* 36px - Hero scores, big numbers */
text-5xl    /* 48px - Marketing pages (rare) */
```

### Font Weights

```css
font-normal    /* 400 - Body text */
font-medium    /* 500 - Buttons, tabs, emphasized text */
font-semibold  /* 600 - Headings, section titles */
font-bold      /* 700 - Strong emphasis (use sparingly) */
```

### Line Heights

```css
leading-tight    /* 1.25 - Headings */
leading-snug     /* 1.375 - Subheadings */
leading-normal   /* 1.5 - Body text (default) */
leading-relaxed  /* 1.625 - Long-form content */
```

---

## Spacing & Layout

### Spacing Scale (Tailwind)

Consistent spacing creates visual rhythm:

```css
/* Tailwind spacing scale (multiples of 4px) */
space-0.5   /* 2px - Tight spacing within components */
space-1     /* 4px - Icon spacing */
space-2     /* 8px - Small gaps */
space-3     /* 12px - Text to icon */
space-4     /* 16px - Component padding (small) */
space-6     /* 24px - Component padding (medium) */
space-8     /* 32px - Component padding (large) */
space-12    /* 48px - Section spacing */
space-16    /* 64px - Large section gaps */
space-24    /* 96px - Page-level spacing */
```

**Usage Guidelines:**
- **4px (space-1)**: Icon and text spacing
- **16px (space-4)**: Component internal padding
- **24px (space-6)**: Gap between related components
- **48px (space-12)**: Gap between unrelated sections
- **64px (space-16)**: Page-level whitespace

### Grid & Layout

```css
/* Container widths */
max-w-sm     /* 384px - Mobile, narrow forms */
max-w-md     /* 448px - Metadata forms */
max-w-lg     /* 512px - Upload modal */
max-w-xl     /* 576px - Content pages */
max-w-2xl    /* 672px - Single-column layouts */
max-w-4xl    /* 896px - Analysis page */
max-w-6xl    /* 1152px - Dashboard (3-column) */
max-w-7xl    /* 1280px - Wide tables, analytics */
```

### Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small tablets (portrait) */
md: 768px   /* Tablets (landscape), small laptops */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops (optional) */
```

**Mobile-first approach:**
- Design for 375px width first (iPhone SE)
- Add `sm:` for tablet adjustments
- Add `lg:` for desktop enhancements

---

## Component Patterns

### Buttons

```tsx
// Primary action - Most important action on page
<button className="bg-primary-500 hover:bg-primary-600 text-white 
                   font-medium px-6 py-3 rounded-lg transition-colors
                   focus:outline-none focus:ring-2 focus:ring-primary-400 
                   focus:ring-offset-2">
  Upload Recording
</button>

// Secondary action - Less emphasis
<button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 
                   font-medium px-6 py-3 rounded-lg transition-colors">
  Cancel
</button>

// Destructive action - Delete, stop
<button className="bg-error-500 hover:bg-error-600 text-white 
                   font-medium px-6 py-3 rounded-lg transition-colors">
  Delete Interview
</button>

// Ghost button - Tertiary actions
<button className="text-neutral-600 hover:bg-neutral-100 
                   font-medium px-4 py-2 rounded-lg transition-colors">
  View Details →
</button>
```

### Cards

```tsx
// Interview card
<div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm 
                border border-neutral-200 dark:border-neutral-700 
                p-6 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        Amazon SWE II
      </h3>
      <p className="text-sm text-neutral-500">Behavioral Round • 42 mins</p>
    </div>
    <span className="inline-flex items-center px-3 py-1 rounded-full 
                     bg-success-50 text-success-700 text-sm font-medium">
      ✅ Complete
    </span>
  </div>
  <button className="text-primary-500 hover:text-primary-600 font-medium">
    View Analysis →
  </button>
</div>
```

### Status Badges

```tsx
// Processing status badges
const statusStyles = {
  uploading: "bg-neutral-100 text-neutral-700",
  uploaded: "bg-info-50 text-info-700",
  transcribing: "bg-warning-50 text-warning-700",
  analyzing: "bg-warning-50 text-warning-700",
  completed: "bg-success-50 text-success-700",
  failed: "bg-error-50 text-error-700",
};

<span className={`inline-flex items-center px-3 py-1 rounded-full 
                  text-sm font-medium ${statusStyles[status]}`}>
  {statusIcon} {statusText}
</span>
```

### Progress Bars

```tsx
// Upload progress
<div className="w-full">
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-neutral-700 font-medium">Uploading...</span>
    <span className="text-neutral-500">{progress}% • {timeRemaining}</span>
  </div>
  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-primary-500 transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

### Form Inputs

```tsx
// Text input
<div className="space-y-2">
  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
    Company Name
  </label>
  <input
    type="text"
    placeholder="e.g., Amazon"
    className="w-full px-4 py-3 rounded-lg border border-neutral-200 
               dark:border-neutral-700 bg-white dark:bg-neutral-800
               text-neutral-900 dark:text-neutral-50 placeholder-neutral-400
               focus:outline-none focus:ring-2 focus:ring-primary-400 
               focus:border-transparent transition-colors"
  />
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- ✅ Text on background: Minimum 4.5:1 ratio
- ✅ Large text (18px+): Minimum 3:1 ratio
- ✅ Interactive elements: Minimum 3:1 ratio

**Keyboard Navigation:**
- ✅ All interactive elements focusable via Tab
- ✅ Visible focus indicators (ring-2 ring-primary-400)
- ✅ Logical tab order (matches visual layout)
- ✅ Skip links for screen readers

**Screen Reader Support:**
- ✅ Semantic HTML (`<main>`, `<nav>`, `<article>`)
- ✅ ARIA labels for icon-only buttons
- ✅ Live regions for status updates
- ✅ Alt text for all images

**Motion & Animation:**
- ✅ Respect `prefers-reduced-motion`
- ✅ No auto-playing videos
- ✅ Optional animations (can disable)

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Visible

```css
/* Only show focus ring on keyboard navigation */
.focus-visible:focus {
  @apply outline-none ring-2 ring-primary-400 ring-offset-2;
}
```

---

## Implementation Guide

### Step 1: Update Tailwind Configuration

Since we're using Tailwind CSS v4 with inline theme, update `apps/web/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  /* Primary Colors */
  --color-primary-50: #f0f4ff;
  --color-primary-100: #dce5ff;
  --color-primary-200: #bfcfff;
  --color-primary-300: #91b0ff;
  --color-primary-400: #5b8bff;
  --color-primary-500: #3b6fff;
  --color-primary-600: #2855e0;
  --color-primary-700: #1e42b5;
  --color-primary-800: #1d3a92;
  --color-primary-900: #1d3576;
  --color-primary-950: #151f47;
  
  /* Neutral Colors */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-200: #e4e4e7;
  --color-neutral-300: #d4d4d8;
  --color-neutral-400: #a1a1aa;
  --color-neutral-500: #71717a;
  --color-neutral-600: #52525b;
  --color-neutral-700: #3f3f46;
  --color-neutral-800: #27272a;
  --color-neutral-900: #18181b;
  --color-neutral-950: #09090b;
  
  /* Semantic Colors */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;
  
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;
  
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  
  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", 
               "Oxygen", "Ubuntu", "Cantarell", sans-serif;
  --font-mono: ui-monospace, "SF Mono", Monaco, monospace;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  @theme inline {
    --color-primary-500: #5b8bff;
    --color-neutral-50: #18181b;
    --color-neutral-100: #27272a;
    --color-neutral-200: #3f3f46;
    --color-neutral-600: #d4d4d8;
    --color-neutral-700: #e4e4e7;
    --color-neutral-800: #f4f4f5;
    --color-neutral-900: #fafafa;
  }
}

/* Global styles */
body {
  @apply bg-neutral-50 text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300;
}
```

### Step 2: Install shadcn/ui

```bash
cd apps/web

# Initialize shadcn/ui (interactive prompts will ask for style preferences)
npx shadcn@latest init

# Select:
# - Style: Default
# - Base color: Neutral (we'll customize)
# - CSS variables: Yes
# - Tailwind CSS: Yes (already installed)

# Add initial components
npx shadcn@latest add button card progress badge dialog toast input
```

### Step 3: Create Component Structure

```bash
cd apps/web

# Create component directories
mkdir -p components/ui           # shadcn/ui components (auto-created)
mkdir -p components/features     # Feature-specific components
mkdir -p components/layout       # Layout components
mkdir -p lib/utils               # Utility functions
```

### Step 4: Build Recording Window Component (Example)

Create `apps/web/components/features/recording-window.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function RecordingWindow() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  
  return (
    <div 
      className="fixed top-4 right-4 z-50 
                 bg-white/30 dark:bg-black/30 backdrop-blur-sm
                 border border-neutral-200/50 dark:border-neutral-700/50
                 rounded-full px-4 py-2 shadow-lg
                 opacity-30 hover:opacity-100 transition-opacity
                 flex items-center gap-3"
    >
      {/* Recording indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isRecording ? 'bg-error-500 animate-pulse' : 'bg-neutral-400'
        }`} />
        <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
          {formatDuration(duration)}
        </span>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <Tooltip content="Pause">
          <Button size="icon" variant="ghost" className="h-6 w-6">
            <PauseIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Stop">
          <Button size="icon" variant="ghost" className="h-6 w-6 text-error-500">
            <StopIcon />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
```

### Step 5: Testing Accessibility

```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y
```

Add to `apps/web/eslint.config.mjs`:

```js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  // ... existing config
  {
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
```

---

## Summary

### Quick Reference Card

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Color Palette** | Blue primary, neutral grays | Professional, trustworthy, accessible |
| **Component Framework** | shadcn/ui + Radix | Copy-paste ownership, best accessibility |
| **Typography** | System font stack | Zero load time, native feel |
| **Layout** | Mobile-first, 375px base | Works everywhere, progressive enhancement |
| **Accessibility** | WCAG 2.1 AA | Legal compliance, inclusive design |
| **Dark Mode** | Auto-detect + manual toggle | User preference, reduced eye strain |

### Next Steps

1. ✅ **Review this document** with the team
2. ⬜ **Initialize shadcn/ui** in `apps/web/`
3. ⬜ **Update `globals.css`** with color palette
4. ⬜ **Create first components** (Button, Card, Progress)
5. ⬜ **Build recording window** prototype
6. ⬜ **Design dashboard layout** in Figma (optional)
7. ⬜ **Test with real users** for feedback

---

**Questions?** Reference the visual inspiration links or reach out to the design team for clarification.

**Updates:** This is a living document. Update as design patterns evolve.
