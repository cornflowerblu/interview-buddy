# Interview Buddy - Frontend Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: 2025-12-08  
**For**: Frontend developers getting started with the design system

---

## 🎨 What You Have

### Design System Documents

1. **[design-system.md](./design-system.md)** - Complete design system
   - Color palette (primary, neutral, semantic)
   - Component framework recommendation (shadcn/ui)
   - Typography, spacing, layout guidelines
   - Component patterns and code examples
   - Accessibility requirements

2. **[visual-inspiration.md](./visual-inspiration.md)** - Visual examples
   - Recording window inspiration (Loom, CleanShot X, macOS)
   - Dashboard inspiration (Linear, Notion, Height)
   - Upload experience (WeTransfer, Dropbox)
   - Data visualization (Grammarly, GitHub)
   - Micro-interactions and animations

### Already Implemented

✅ **Tailwind CSS v4** - Installed and configured  
✅ **Color Palette** - Added to `globals.css` with dark mode support  
✅ **Typography** - System font stack configured  
✅ **Accessibility** - Focus states, reduced motion support  

---

## 🚀 Next Steps

### Step 1: Install shadcn/ui (5 minutes)

```bash
cd apps/web

# Initialize shadcn/ui
npx shadcn@latest init

# When prompted, select:
# ✓ Style: Default
# ✓ Base color: Neutral
# ✓ CSS variables: Yes
# ✓ Tailwind CSS: Yes (already installed)
# ✓ Path aliases: @/components, @/lib

# Install initial components for MVP
npx shadcn@latest add button card progress badge dialog toast input select textarea tabs
```

This will create:
- `components/ui/` - UI component primitives
- `lib/utils.ts` - Utility functions (cn helper)
- `components.json` - Configuration file

### Step 2: Verify Color Palette (2 minutes)

The color palette is already added to `apps/web/app/globals.css`. Test it:

```tsx
// Create apps/web/app/test-colors/page.tsx
export default function TestColors() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
        Color Palette Test
      </h1>
      
      {/* Primary colors */}
      <div className="flex gap-2">
        <div className="w-16 h-16 bg-primary-50 rounded" />
        <div className="w-16 h-16 bg-primary-100 rounded" />
        <div className="w-16 h-16 bg-primary-200 rounded" />
        <div className="w-16 h-16 bg-primary-500 rounded" />
        <div className="w-16 h-16 bg-primary-700 rounded" />
      </div>
      
      {/* Semantic colors */}
      <div className="flex gap-4">
        <div className="px-4 py-2 bg-success-50 text-success-700 rounded-lg">
          Success
        </div>
        <div className="px-4 py-2 bg-warning-50 text-warning-700 rounded-lg">
          Warning
        </div>
        <div className="px-4 py-2 bg-error-50 text-error-700 rounded-lg">
          Error
        </div>
        <div className="px-4 py-2 bg-info-50 text-info-700 rounded-lg">
          Info
        </div>
      </div>
    </div>
  );
}
```

Run `npm run dev` and visit http://localhost:3000/test-colors

### Step 3: Build First Component - Recording Window (30 minutes)

Create a minimal recording window component:

```bash
# Create component file
mkdir -p apps/web/components/features
touch apps/web/components/features/recording-window.tsx
```

```tsx
// apps/web/components/features/recording-window.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function RecordingWindow() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState({ x: window.innerWidth - 180, y: 20 });

  // Duration ticker
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed z-50 flex items-center gap-3 px-4 py-2 
                 bg-white/30 dark:bg-black/30 backdrop-blur-sm
                 border border-neutral-200/50 dark:border-neutral-700/50
                 rounded-full shadow-lg
                 opacity-30 hover:opacity-100 transition-opacity duration-200
                 cursor-move select-none"
      style={{ top: position.y, left: position.x }}
    >
      {/* Recording indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isRecording ? 'bg-error-500 animate-pulse' : 'bg-neutral-400'
        }`} />
        <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls (show on hover) */}
      <div className="flex items-center gap-1">
        {!isRecording ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsRecording(true)}
            className="h-6 px-2 text-xs"
          >
            Start
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRecording(false)}
              className="h-6 px-2 text-xs"
              aria-label="Pause recording"
            >
              ⏸
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsRecording(false);
                setDuration(0);
              }}
              className="h-6 px-2 text-xs text-error-500 hover:text-error-600"
              aria-label="Stop recording"
            >
              ⏹
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

Add to page to test:

```tsx
// apps/web/app/page.tsx
import { RecordingWindow } from '@/components/features/recording-window';

export default function Home() {
  return (
    <div className="min-h-screen">
      <RecordingWindow />
      {/* ... rest of page */}
    </div>
  );
}
```

### Step 4: Build Interview Card Component (30 minutes)

```tsx
// apps/web/components/features/interview-card.tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type InterviewStatus = 'uploading' | 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed';

interface InterviewCardProps {
  id: string;
  company: string;
  jobTitle: string;
  interviewType: string;
  duration: number;
  status: InterviewStatus;
  score?: number;
  createdAt: Date;
}

const statusConfig: Record<InterviewStatus, { label: string; variant: string; className: string }> = {
  uploading: { label: 'Uploading', variant: 'secondary', className: 'bg-neutral-100 text-neutral-700' },
  uploaded: { label: 'Uploaded', variant: 'secondary', className: 'bg-info-50 text-info-700' },
  transcribing: { label: 'Transcribing', variant: 'secondary', className: 'bg-warning-50 text-warning-700' },
  analyzing: { label: 'Analyzing', variant: 'secondary', className: 'bg-warning-50 text-warning-700' },
  completed: { label: 'Complete', variant: 'secondary', className: 'bg-success-50 text-success-700' },
  failed: { label: 'Failed', variant: 'destructive', className: 'bg-error-50 text-error-700' },
};

export function InterviewCard({
  company,
  jobTitle,
  interviewType,
  duration,
  status,
  score,
  createdAt,
}: InterviewCardProps) {
  const config = statusConfig[status];
  const durationMins = Math.floor(duration / 60);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {company}
          </h3>
          <p className="text-sm text-neutral-500">
            {jobTitle} • {interviewType} • {durationMins} mins
          </p>
        </div>
        <Badge className={config.className}>
          {status === 'completed' && '✅'} {config.label}
        </Badge>
      </div>

      {score !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600 dark:text-neutral-400">Overall Score</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">{score}/100</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {status === 'completed' ? (
        <Button variant="ghost" className="w-full text-primary-500 hover:text-primary-600">
          View Analysis →
        </Button>
      ) : status === 'analyzing' || status === 'transcribing' ? (
        <div className="text-sm text-neutral-500 text-center">
          ⏳ Processing...
        </div>
      ) : null}
    </Card>
  );
}
```

Test the card:

```tsx
// apps/web/app/page.tsx
import { InterviewCard } from '@/components/features/interview-card';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-8">Your Interviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InterviewCard
          id="1"
          company="Amazon"
          jobTitle="SWE II"
          interviewType="Behavioral"
          duration={2520} // 42 mins
          status="completed"
          score={78}
          createdAt={new Date()}
        />
        <InterviewCard
          id="2"
          company="Google"
          jobTitle="PM L4"
          interviewType="Phone Screen"
          duration={1680} // 28 mins
          status="analyzing"
          createdAt={new Date()}
        />
        <InterviewCard
          id="3"
          company="Microsoft"
          jobTitle="Data Scientist"
          interviewType="Technical"
          duration={900} // 15 mins
          status="uploaded"
          createdAt={new Date()}
        />
      </div>
    </div>
  );
}
```

### Step 5: Create Upload Form (45 minutes)

See [design-system.md](./design-system.md#upload-flow) for the full upload flow design.

Key components needed:
- File drop zone (drag and drop)
- Progress bar (with percentage and time)
- Metadata form (company, job title, type)
- Success state

Use shadcn/ui components:
- `Input` for text fields
- `Select` for dropdowns (interview type)
- `Textarea` for notes
- `Progress` for upload bar
- `Toast` for notifications

---

## 📚 Reference Documentation

### Colors

All colors are defined in `apps/web/app/globals.css`:

```css
/* Usage examples */
bg-primary-500      /* Primary brand blue */
text-neutral-700    /* Body text */
border-neutral-200  /* Borders, dividers */
bg-success-50       /* Success background */
text-error-600      /* Error text */
```

See [design-system.md](./design-system.md#color-palette) for the full palette.

### Components

All shadcn/ui components are in `apps/web/components/ui/`.

Usage:

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Use in your component
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
```

See [shadcn/ui docs](https://ui.shadcn.com/) for all component APIs.

### Responsive Design

Mobile-first approach with Tailwind breakpoints:

```tsx
<div className="
  w-full              {/* Mobile: full width */}
  md:w-1/2            {/* Tablet: half width */}
  lg:w-1/3            {/* Desktop: third width */}
">
  Content
</div>
```

Breakpoints:
- `sm:` 640px (small tablets)
- `md:` 768px (tablets)
- `lg:` 1024px (laptops)
- `xl:` 1280px (desktops)

---

## 🎯 MVP Priorities

Focus on these pages/components first:

### Phase 1 (Week 1)
- [ ] Recording window component
- [ ] Interview card component
- [ ] Dashboard page (list of interviews)

### Phase 2 (Week 2)
- [ ] Upload page with drag-and-drop
- [ ] Metadata form
- [ ] Progress indicators

### Phase 3 (Week 3)
- [ ] Analysis results page
- [ ] Speech metrics visualization
- [ ] Recommendations display

### Polish (Week 4)
- [ ] Animations and micro-interactions
- [ ] Loading states (skeletons)
- [ ] Error states and empty states
- [ ] Mobile optimization

---

## 🧪 Testing

### Visual Testing

Run dev server and test on:
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Accessibility Testing

```bash
# Install axe DevTools Chrome extension
# Run automated checks on each page

# Manual checks:
# - Tab through all interactive elements
# - Test with VoiceOver (Mac) or NVDA (Windows)
# - Check color contrast (4.5:1 minimum)
```

### Responsive Testing

```bash
# Chrome DevTools
# - Open DevTools (Cmd+Opt+I)
# - Toggle device toolbar (Cmd+Shift+M)
# - Test: iPhone SE (375px), iPad (768px), Desktop (1280px)
```

---

## 💡 Tips

### Use the Design System

Don't reinvent components. Check [design-system.md](./design-system.md#component-patterns) first for:
- Button styles
- Card patterns
- Form inputs
- Status badges
- Progress bars

### Copy from Inspiration

Browse [visual-inspiration.md](./visual-inspiration.md) for examples of:
- Layout patterns (Linear, Notion)
- Upload flows (WeTransfer, Dropbox)
- Data viz (Grammarly, GitHub)

### Ask for Help

If you're unsure about:
- Color usage → See [design-system.md#color-palette](./design-system.md#color-palette)
- Component choice → See [design-system.md#component-framework](./design-system.md#component-framework)
- Layout patterns → See [visual-inspiration.md](./visual-inspiration.md)
- Accessibility → See [design-system.md#accessibility](./design-system.md#accessibility)

---

## 📖 Further Reading

- [Next.js Docs](https://nextjs.org/docs) - App Router, Server Components
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Utility classes
- [shadcn/ui](https://ui.shadcn.com/) - Component examples
- [Radix UI](https://www.radix-ui.com/) - Accessibility primitives
- [Framer Motion](https://www.framer.com/motion/) - Animations (optional)

---

**Questions?** Ask in the team channel or create an issue.

**Ready to code?** Start with the recording window component! 🚀
