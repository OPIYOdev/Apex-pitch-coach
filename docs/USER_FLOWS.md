# APEX User Flows & Interaction Design

This document outlines the optimized user flows for APEX Pitch Coach, designed for maximum engagement and conversion.

## Core User Journeys

### 1. First-Time User (Onboarding)

```
App Launch
    ↓
Check Onboarding Status (AsyncStorage)
    ↓
[Not Completed] → OnboardingFlow (3 steps)
    ↓
    Step 1: Welcome to APEX (value prop)
    Step 2: The APEX Index (scoring system)
    Step 3: Real-Time Coaching (frameworks)
    ↓
Mark Onboarding Complete
    ↓
Redirect to Home Dashboard
```

**Key Metrics:**
- Completion rate target: 85%+
- Average time: 45-60 seconds
- Drop-off point monitoring: Step 2 (most critical)

### 2. Pitch Analysis Flow (Core Feature)

```
Home Dashboard
    ↓
Tap "Enter Arena" or Arena Tab
    ↓
Arena Screen Loads
    ↓
User Enters Pitch Text
    ↓
Tap "RUN SIMULATION (5 tokens)"
    ↓
Check Token Balance
    ├─ [Insufficient] → Redirect to Tokens
    └─ [Sufficient] → Deduct 5 tokens
    ↓
Send to Grok API
    ↓
Display Feedback (Animated)
    ├─ Verdict
    ├─ APEX Metrics (Frame, Hook, Logic, Urgency)
    ├─ Overall Score Ring
    ├─ The Drill
    ├─ Elite Rewrite
    └─ The Journey
    ↓
User Options:
├─ Analyze Another Pitch
├─ View Levels
└─ Purchase More Tokens
```

**Performance Targets:**
- API response time: <3 seconds
- Animation load time: <500ms
- User satisfaction: 4.5+/5

### 3. Token Purchase Flow (Monetization)

```
Tokens Screen
    ↓
View Current Balance
    ↓
Browse Token Packages (Starter, Pro, Elite)
    ↓
Tap Package
    ↓
Payment Modal Opens
    ├─ Package details
    ├─ Price in KES
    └─ M-Pesa payment option
    ↓
Enter Phone Number (254XXXXXXXXX)
    ↓
Tap "Confirm Payment"
    ↓
Initiate M-Pesa STK Push
    ↓
[User enters M-Pesa PIN]
    ↓
Payment Callback
    ├─ [Success] → Credit tokens + Show confirmation
    └─ [Failed] → Show error + Retry option
    ↓
Update Dashboard
```

**Conversion Targets:**
- Checkout completion: 70%+
- Payment success rate: 95%+
- Average order value: 500+ KES

### 4. Level Progression Flow

```
Levels Screen
    ↓
View Current Level (1-5)
    ├─ Locked Levels (grayed out)
    └─ Active Levels (interactive)
    ↓
Tap Level
    ↓
View Level Details
    ├─ Description
    ├─ XP Progress Bar
    └─ Active Drills (3 prompts)
    ↓
User Options:
├─ Start Drill (navigate to Arena)
├─ View Next Level Requirements
└─ Go Back
```

**Engagement Targets:**
- Daily active users: 40%+
- Level progression rate: 1 level/month average
- Drill completion rate: 60%+

## Interaction Patterns

### 1. Loading States

**Pitch Analysis Loading:**
```tsx
{loading ? (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1 }}
  >
    <ActivityIndicator color="#fff" />
  </motion.div>
) : (
  <Text>RUN SIMULATION</Text>
)}
```

**Token Package Loading:**
- Show skeleton loaders for packages
- Animate in packages with stagger effect
- Maintain layout stability (no jank)

### 2. Empty States

**No Transactions:**
```
"No missions recorded yet."
[Tap to start your first simulation]
```

**No Packages Available:**
```
"No active plans found."
[Admin: Add plans in settings]
```

### 3. Error Handling

**Insufficient Tokens:**
```
Alert: "Not enough tokens"
[Dismiss] [Go to Tokens]
```

**Payment Failed:**
```
Alert: "Payment Failed: [Error Message]"
[Dismiss] [Retry]
```

**API Error:**
```
Alert: "Analysis Failed: [Error Message]"
[Dismiss] [Try Again]
```

## Navigation Optimization

### Tab Navigation (Bottom Tabs)
1. **Home** - Dashboard & quick access
2. **Arena** - Pitch analysis
3. **Levels** - Progression tracking
4. **Tokens** - Purchase & balance
5. **Settings** - Account & preferences

**Optimization:**
- Preload frequently accessed tabs
- Cache user profile data
- Lazy load heavy components

### Deep Linking (Future)
```
apex://pitch/{pitchId}
apex://level/{levelNumber}
apex://tokens/packages
apex://settings/profile
```

## Conversion Funnel

```
App Launch
    ↓ (100%)
Onboarding Completed
    ↓ (85%)
First Pitch Analysis
    ↓ (70%)
Token Purchase
    ↓ (50%)
Level 2 Reached
    ↓ (35%)
Repeat User (30+ days)
    ↓ (20%)
Premium Subscriber
    ↓ (10%)
```

**Optimization Strategies:**
1. **Onboarding:** Make value prop crystal clear
2. **First Analysis:** Ensure fast, impressive feedback
3. **Token Purchase:** Offer first-time discount (20% off)
4. **Level Progression:** Celebrate milestones with notifications
5. **Retention:** Daily drills + weekly challenges

## Micro-Interactions

### 1. Button Press Feedback
```tsx
whileTap={{ scale: 0.95 }}
whileHover={{ scale: 1.02 }}
```

### 2. List Item Hover
```tsx
whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
```

### 3. Card Entrance
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 * index }}
```

### 4. Score Ring Animation
```tsx
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: "spring", stiffness: 100 }}
```

## Performance Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Current |
|--------|--------|---------|
| App Load Time | <2s | TBD |
| Onboarding Completion | 85% | TBD |
| First Pitch Analysis | <3s | TBD |
| Token Purchase Conversion | 50% | TBD |
| Level 2 Reach | 35% | TBD |
| 30-Day Retention | 20% | TBD |
| Average Session Duration | 5+ min | TBD |
| Daily Active Users | 1000+ | TBD |

### Monitoring

- **Sentry:** Error tracking and performance monitoring
- **Firebase Analytics:** User behavior and funnel tracking
- **Custom Events:** Track key actions (pitch analysis, purchase, level up)

## A/B Testing Opportunities

1. **Onboarding Length:** 3 steps vs. 5 steps
2. **Token Pricing:** Current vs. discounted first-time offer
3. **CTA Button Text:** "RUN SIMULATION" vs. "ANALYZE PITCH"
4. **Feedback Display:** Animated reveal vs. all at once
5. **Level Unlock:** XP-based vs. time-based

## Accessibility in User Flows

### Screen Reader Support
- All interactive elements have `accessibilityLabel`
- Form inputs have clear labels
- Announcements for state changes

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space to activate buttons
- Escape to close modals

### Color Contrast
- All text meets WCAG AA standards
- Don't rely on color alone for status

## Future Enhancements

- [ ] Social sharing of pitch scores
- [ ] Leaderboard for top performers
- [ ] Referral program (invite friends)
- [ ] AI-powered drill recommendations
- [ ] Voice pitch recording & analysis
- [ ] Pitch history & analytics dashboard
- [ ] Team/group pitch sessions
- [ ] Integration with calendar for scheduled drills
