# APEX Pro Max Component Library

This document outlines the premium component library used to build the APEX Pitch Coach interface with a "Pro Max" aesthetic inspired by 21st.dev design patterns.

## Core Components

### 1. AnimatedCard
**Purpose:** Reusable card wrapper with Framer Motion animations.

**Props:**
- `delay` (number): Animation delay in seconds
- `variant` (string): Animation style - `slideUp`, `slideDown`, `bounce`, `fade`
- `children` (ReactNode): Card content

**Usage:**
```tsx
<AnimatedCard delay={0.1} variant="slideUp">
  <View className="p-4 bg-surface rounded-lg">
    <Text>Content here</Text>
  </View>
</AnimatedCard>
```

### 2. ScoreRing
**Purpose:** Animated circular progress indicator for APEX Elite Index scores.

**Props:**
- `score` (number): Score value (0-10)
- `size` (number): Ring diameter in pixels (default: 120)

**Usage:**
```tsx
<ScoreRing score={7.5} />
```

### 3. Badge
**Purpose:** Status indicator with multiple variants.

**Props:**
- `label` (string): Badge text
- `variant` (string): `primary`, `success`, `warning`, `error`, `neutral`
- `size` (string): `sm`, `md`, `lg`
- `animated` (boolean): Enable entrance animation
- `icon` (string): Optional emoji or icon

**Usage:**
```tsx
<Badge label="BEST VALUE" variant="primary" size="md" animated icon="⭐" />
```

### 4. ProgressBar
**Purpose:** Animated progress indicator for XP, token usage, etc.

**Props:**
- `value` (number): Current progress
- `max` (number): Maximum value
- `label` (string): Label text
- `showPercentage` (boolean): Display percentage
- `color` (string): Progress bar color (hex)
- `size` (string): `sm`, `md`, `lg`
- `animated` (boolean): Enable pulsing animation

**Usage:**
```tsx
<ProgressBar value={150} max={200} label="Elite XP" color="#3b82f6" animated />
```

### 5. StatCard
**Purpose:** Display key metrics with trend indicators.

**Props:**
- `icon` (string): Emoji or icon
- `label` (string): Metric name
- `value` (string | number): Current value
- `unit` (string): Unit of measurement
- `trend` (string): `up`, `down`, `neutral`
- `delay` (number): Animation delay

**Usage:**
```tsx
<StatCard icon="💎" label="Tokens" value={250} unit="remaining" trend="up" delay={0.1} />
```

### 6. GradientBgEnhanced
**Purpose:** Animated gradient background with floating accents.

**Props:**
- `variant` (string): `primary`, `success`, `warning`, `error`, `neutral`
- `animated` (boolean): Enable floating animation
- `children` (ReactNode): Content

**Usage:**
```tsx
<GradientBgEnhanced variant="primary" animated>
  <View className="p-8">
    <Text>Premium content</Text>
  </View>
</GradientBgEnhanced>
```

### 7. OnboardingFlow
**Purpose:** Multi-step onboarding experience with progress tracking.

**Props:**
- `steps` (OnboardingStep[]): Array of onboarding steps
- `onComplete` (function): Callback when onboarding is finished

**Step Structure:**
```tsx
{
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

**Usage:**
```tsx
<OnboardingFlow 
  steps={ONBOARDING_STEPS} 
  onComplete={() => setShowOnboarding(false)} 
/>
```

## Design Principles

### 1. Hierarchy & Emphasis
- **Primary Actions:** Use `bg-primary` with white text
- **Secondary Actions:** Use `border border-border` with `text-foreground`
- **Tertiary Actions:** Use `text-primary` without background
- **Disabled State:** Use `opacity-50` and `pointer-events-none`

### 2. Color System
- **Foreground:** Text color (adapts to light/dark mode)
- **Background:** Page background
- **Surface:** Card/container background
- **Border:** Subtle divider color
- **Primary:** Brand color (blue)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Error:** Red (#ef4444)
- **Muted:** Gray text for secondary information

### 3. Spacing & Sizing
- **Gap:** Use `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8` for consistent spacing
- **Padding:** Use `p-4`, `p-6`, `p-8` for containers
- **Rounded:** Use `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px)

### 4. Typography
- **Headings:** `text-2xl font-black uppercase tracking-tighter` for main titles
- **Subheadings:** `text-lg font-bold` for section titles
- **Body:** `text-sm text-foreground` for regular text
- **Labels:** `text-xs font-bold text-muted uppercase tracking-widest`
- **Emphasis:** Use `font-black` for high-impact text

### 5. Animation Patterns
- **Entrance:** `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}`
- **Hover:** `whileHover={{ scale: 1.05, y: -4 }}`
- **Press:** `whileTap={{ scale: 0.95 }}`
- **Stagger:** Use `staggerChildren: 0.1` for list animations
- **Duration:** Keep animations between 0.3s - 0.8s for snappy feel

## 21st.dev Aesthetic Guidelines

### 1. Minimal & Clean
- Avoid clutter; use whitespace strategically
- One clear call-to-action per screen
- Limit color palette to 3-4 primary colors

### 2. High-Status Design
- Use premium typography (bold, uppercase, tight tracking)
- Employ generous padding and spacing
- Subtle shadows and borders for depth
- Animated elements should feel intentional, not gratuitous

### 3. Micro-interactions
- Buttons respond immediately to touch
- Smooth transitions between states
- Feedback on every interaction (haptics when available)
- Loading states should feel premium (spinner animations)

### 4. Responsive & Accessible
- Use `flex-1` for flexible layouts
- Test on mobile, tablet, and web
- Ensure sufficient color contrast
- Provide text labels for all icons
- Support keyboard navigation on web

## Best Practices

### Do's ✅
- Use `motion.div` for animations (Framer Motion)
- Leverage `AnimatedCard` for consistent entrance animations
- Group related metrics using `StatCard` components
- Use `Badge` for status indicators
- Implement `ProgressBar` for any progress tracking

### Don'ts ❌
- Avoid inline styles; use Tailwind classes
- Don't animate too many elements simultaneously
- Avoid using `dark:` prefix; theme system handles this
- Don't create custom colors; use the theme palette
- Avoid animations longer than 1 second

## Performance Tips

1. **Lazy Load:** Use `React.lazy()` for heavy components
2. **Memoization:** Wrap expensive components with `React.memo()`
3. **Animation Optimization:** Use `will-change` sparingly
4. **Image Optimization:** Use appropriate sizes and formats
5. **Bundle Size:** Tree-shake unused components

## Future Enhancements

- [ ] Dark mode toggle component
- [ ] Accessibility audit and improvements
- [ ] Gesture-based interactions (swipe, pinch)
- [ ] Advanced data visualization components
- [ ] Accessibility-first modal system
