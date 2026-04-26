# APEX Responsive Design Guide

This document outlines the responsive design strategy for APEX Pitch Coach across mobile, tablet, and desktop platforms.

## Breakpoints

The app uses Tailwind CSS breakpoints optimized for the Expo web platform:

- **Mobile:** `sm` (640px) - Default mobile experience
- **Tablet:** `md` (768px) - iPad and similar devices
- **Desktop:** `lg` (1024px) and `xl` (1280px) - Web browsers

## Mobile-First Strategy

All components are designed mobile-first, then enhanced for larger screens.

### Example Pattern:
```tsx
<View className="flex-col md:flex-row lg:gap-8 md:gap-6 gap-4">
  <View className="w-full md:w-1/2 lg:w-1/3">
    {/* Content scales based on screen size */}
  </View>
</View>
```

## Layout Patterns

### 1. Single Column (Mobile)
```tsx
<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
  <View className="flex-1 gap-4 p-4">
    {/* Stacked content */}
  </View>
</ScrollView>
```

### 2. Two Column (Tablet+)
```tsx
<View className="flex-row gap-6">
  <View className="flex-1 md:w-1/2">
    {/* Left column */}
  </View>
  <View className="flex-1 md:w-1/2">
    {/* Right column */}
  </View>
</View>
```

### 3. Grid Layout (Desktop)
```tsx
<View className="flex-row flex-wrap gap-4">
  {items.map((item) => (
    <View key={item.id} className="w-full md:w-1/2 lg:w-1/3">
      {/* Grid item */}
    </View>
  ))}
</View>
```

## Component Sizing

### Typography Scaling
| Screen | Heading | Subheading | Body | Label |
|--------|---------|-----------|------|-------|
| Mobile | `text-2xl` | `text-lg` | `text-sm` | `text-xs` |
| Tablet | `text-3xl` | `text-xl` | `text-base` | `text-xs` |
| Desktop | `text-4xl` | `text-2xl` | `text-base` | `text-sm` |

### Padding Scaling
| Screen | Container | Card | Section |
|--------|-----------|------|---------|
| Mobile | `p-4` | `p-4` | `gap-4` |
| Tablet | `p-6` | `p-6` | `gap-6` |
| Desktop | `p-8` | `p-8` | `gap-8` |

## Page-Specific Optimizations

### Home Screen
- **Mobile:** Vertical stack of cards
- **Tablet:** Hero section + 2-column grid below
- **Desktop:** Hero section + 3-column grid

### Arena Screen
- **Mobile:** Full-width pitch input, stacked feedback
- **Tablet:** Side-by-side input and feedback preview
- **Desktop:** Input on left, real-time feedback on right

### Tokens Screen
- **Mobile:** Vertical package list
- **Tablet:** 2-column package grid
- **Desktop:** 3-column package grid with sidebar

### Levels Screen
- **Mobile:** Vertical level cards
- **Tablet:** Vertical levels + right sidebar with details
- **Desktop:** Left sidebar levels + main content area

## Touch & Interaction Optimization

### Button Sizing
- **Minimum touch target:** 44x44px (iOS standard)
- **Comfortable spacing:** 8px between interactive elements
- **Mobile buttons:** `py-4 px-6` (48px height)
- **Desktop buttons:** `py-3 px-4` (40px height)

### Gesture Support
- **Swipe navigation:** Enabled on mobile (Expo Router)
- **Tap feedback:** Use `active:opacity-80` or `whileTap={{ scale: 0.95 }}`
- **Long press:** Consider for context menus on mobile

## Performance Optimization

### Image Optimization
```tsx
// Use responsive image sizes
<Image 
  source={require('./image.png')}
  style={{ 
    width: '100%',
    height: Dimensions.get('window').width * 0.6,
  }}
  resizeMode="cover"
/>
```

### Lazy Loading
```tsx
// Load heavy components on larger screens only
{Platform.OS === 'web' && screenSize.width > 1024 && (
  <HeavyComponent />
)}
```

### Animation Performance
- Reduce animation complexity on mobile
- Use `will-change` sparingly
- Disable animations on low-end devices if needed

## Safe Area Handling

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MyComponent() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
      {/* Content */}
    </View>
  );
}
```

## Dark Mode Responsiveness

The app automatically adapts to the system's dark mode preference. No special responsive handling needed for dark mode—use the theme system:

```tsx
// ✅ Good: Uses theme system
<View className="bg-background text-foreground" />

// ❌ Avoid: Hardcoded colors
<View style={{ backgroundColor: '#ffffff' }} />
```

## Testing Responsive Design

### Mobile Testing
1. Use Expo Go on physical devices
2. Test on iPhone SE (smallest) and iPhone 14 Pro Max (largest)
3. Verify touch targets are at least 44x44px

### Tablet Testing
1. Use iPad simulator or physical device
2. Test landscape and portrait orientations
3. Verify layout adapts properly to wider screens

### Desktop Testing
1. Use Expo web in browser
2. Test at 1024px, 1280px, and 1920px widths
3. Verify keyboard navigation works

### Orientation Testing
```tsx
import { useWindowDimensions } from 'react-native';

export function MyComponent() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  return (
    <View className={isLandscape ? 'flex-row' : 'flex-col'}>
      {/* Content adapts to orientation */}
    </View>
  );
}
```

## Accessibility Considerations

### Responsive Accessibility
- **Font scaling:** Respect user's system font size settings
- **Touch targets:** Ensure 44x44px minimum on all screens
- **Color contrast:** Maintain WCAG AA standards across all breakpoints
- **Text overflow:** Use `numberOfLines` or `ellipsizeMode` to prevent layout breaks

### Screen Reader Support
```tsx
<TouchableOpacity 
  accessible
  accessibilityLabel="Start pitch simulation"
  accessibilityRole="button"
>
  <Text>Start Simulation</Text>
</TouchableOpacity>
```

## Common Pitfalls

### ❌ Don't
- Use fixed widths (e.g., `width: 300`)
- Hardcode font sizes for all screens
- Forget about safe areas (notches, home indicators)
- Ignore landscape orientation
- Use `flex-row` without considering mobile

### ✅ Do
- Use `flex-1` and `flex-row/flex-col` for responsive layouts
- Scale typography with screen size
- Use `useSafeAreaInsets()` for notch handling
- Test on multiple devices and orientations
- Use Tailwind responsive prefixes (`md:`, `lg:`)

## Future Enhancements

- [ ] Tablet-specific navigation drawer
- [ ] Desktop sidebar navigation
- [ ] Responsive modal sizing
- [ ] Adaptive animation complexity
- [ ] Gesture-based navigation on mobile
