# APEX UI/UX Pro Max Guide

## 21st.dev Design Principles

APEX follows the 21st.dev design methodology, emphasizing:

### 1. **Motion & Fluidity**
- All transitions use spring animations (`stiffness: 300, damping: 30`)
- Stagger animations create a sense of hierarchy and intentionality
- Micro-interactions provide tactile feedback without overwhelming

### 2. **Hierarchy & Typography**
- **Headline:** `text-2xl font-bold` for section titles
- **Subheading:** `text-sm text-muted` for descriptive text
- **Action:** `text-base font-bold` for CTAs
- **Metadata:** `text-xs text-muted` for timestamps and labels

### 3. **Color & Contrast**
- **Primary:** `#3b82f6` (Blue) — Actions, highlights, progress
- **Success:** `#10b981` (Green) — Positive feedback, achievements
- **Error:** `#ef4444` (Red) — Warnings, failures
- **Muted:** `#6b7280` (Gray) — Secondary text, disabled states

### 4. **Spacing & Density**
- **Gap:** `gap-4` for major sections, `gap-2` for grouped elements
- **Padding:** `p-4` for card content, `p-6` for hero sections
- **Border Radius:** `rounded-lg` (8px) for cards, `rounded-xl` (12px) for premium elements

---

## Component Animation Patterns

### AnimatedCard
```tsx
<AnimatedCard delay={0.1} variant="slideUp">
  <View>Your content</View>
</AnimatedCard>
```
**Variants:** `fade`, `slideUp`, `slideDown`, `scaleIn`, `bounce`

### ScoreRing
```tsx
<ScoreRing score={8.5} maxScore={10} size={120} />
```
Animated circular progress with color-coded feedback.

### Button
```tsx
<Button variant="primary" size="md" onPress={handlePress}>
  Action Text
</Button>
```
**Variants:** `primary`, `secondary`, `ghost`, `danger`

---

## User Flows

### 1. Onboarding Flow
1. **Welcome Screen** — Introduce APEX philosophy (fade in)
2. **Feature Tour** — 3-4 key modules (slide up, staggered)
3. **Profile Setup** — Name, role, goals (slide down)
4. **First Simulation** — Guided pitch analysis (bounce in)

**Animation Strategy:** Each step fades in with a 0.1s stagger. Progress bar animates linearly.

### 2. Simulation Flow (Arena)
1. **Input Stage** — User enters pitch (border highlight on focus)
2. **Processing** — Loading spinner with rotating animation
3. **Results Display** — Scores animate in with stagger
4. **Score Ring** — Circular progress animates from 0 to final value
5. **Feedback Cards** — Drill, Rewrite, Next Level slide in sequentially

**Animation Strategy:** 
- Input: Border color transitions on focus
- Processing: Rotating spinner (360deg, 1s loop)
- Results: Staggered reveal with 0.1s delays
- Score Ring: Spring animation over 1.2s
- Feedback: Sequential slide-up with 0.1s stagger

### 3. Payment Flow (Tokens)
1. **Package Selection** — Cards scale on hover, highlight on tap
2. **Modal Open** — Backdrop fades in, modal scales from 0.9 to 1
3. **Phone Input** — Border highlights on focus
4. **Confirmation** — Button scales on press, loading spinner appears
5. **Success** — Modal fades out, transaction appears in history

**Animation Strategy:**
- Package Cards: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`
- Modal: `initial={{ opacity: 0, scale: 0.9 }}`, `animate={{ opacity: 1, scale: 1 }}`
- Transactions: Staggered reveal with 0.05s delays

### 4. Level Progression (Levels)
1. **Level List** — Cards stagger in from left (x: -20)
2. **Level Selection** — Selected card highlights, XP bar animates
3. **Drill Prompts** — Staggered reveal with hover effects
4. **Locked State** — Lock icon rotates continuously

**Animation Strategy:**
- List: Staggered reveal with 0.1s delays
- Selection: Highlight with scale animation on selected level
- XP Bar: Animates from 0 to current value over 1s
- Drills: Staggered reveal with 0.05s delays, hover shifts right

---

## Accessibility Standards

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual hierarchy
- Focus states are clearly visible (border highlight)

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for icon-only buttons
- Descriptive alt text for images

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for body, 3:1 for large text)
- Color is never the only indicator of status (use icons + text)

### Motion Sensitivity
- Animations respect `prefers-reduced-motion` media query
- Critical animations (loading) are always visible
- No auto-playing video or sound

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px (default)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Layout Adjustments
- **Mobile:** Full-width cards, single-column layout
- **Tablet:** 2-column grid for packages, larger touch targets
- **Desktop:** 3-column grid, sidebar navigation

### Touch Targets
- Minimum 44x44px for interactive elements
- Extra padding on mobile for comfortable interaction

---

## Performance Optimization

### Animation Performance
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `width` or `height` (use `scale` instead)
- Limit simultaneous animations to < 5 elements

### Bundle Size
- Framer Motion: ~40KB (gzipped)
- Lucide React: ~15KB (gzipped)
- Total overhead: ~55KB

### Loading States
- Skeleton screens for data-heavy sections
- Progressive enhancement (show content as it loads)
- Optimistic updates for user actions

---

## Dark Mode Support

APEX supports dark mode via Tailwind's `dark:` prefix:

```tsx
<View className="bg-surface dark:bg-slate-900">
  <Text className="text-foreground dark:text-white">Content</Text>
</View>
```

---

## Testing Checklist

- [ ] All animations perform smoothly (60 FPS)
- [ ] Keyboard navigation works on all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive layout works on all breakpoints
- [ ] Touch targets are at least 44x44px
- [ ] Loading states are clearly visible
- [ ] Error messages are descriptive and actionable

---

## Future Enhancements

1. **Gesture Animations** — Swipe to navigate between tabs
2. **Haptic Feedback** — Vibration on button press (mobile)
3. **Voice Feedback** — Audio cues for key actions
4. **Advanced Analytics** — Track user engagement with animations
5. **A/B Testing** — Test animation variations for conversion impact
