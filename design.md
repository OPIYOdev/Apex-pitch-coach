# APEX — Elite Pitch Coach Mobile App Design

## Overview
A production-grade React Native mobile app for pitch coaching powered by the Grok API. The app features progressive skill levels, AI-powered feedback, voice input/output, and a token-based economy with M-Pesa payment support. Founders get unlimited free access.

---

## Screen List

### Core Screens
1. **Onboarding** — Welcome, user type selection (Founder/Regular), and initial setup
2. **Home (Arena)** — Main pitch input, live coaching feedback, score visualization
3. **Levels** — Progressive skill progression (Rookie → Elite), XP tracking, unlock system
4. **Coach Chat** — Conversational coaching, drill suggestions, personalized guidance
5. **History** — Pitch history with scores, trends, and performance analytics
6. **Playbook** — 8-section coaching guide (Hook, Pain, Solution, Why Now, Credibility, Close, Lengths, Voice/Body)
7. **Tokens** — Token balance, purchase history, M-Pesa payment integration
8. **Settings** — User preferences, theme, notifications, logout
9. **Founder Terminal** — Admin panel for M-Pesa credentials, user management, analytics

### Modal Screens
- **Pitch Feedback Modal** — Full-screen feedback display with scores, drill, and rewrite
- **Payment Modal** — M-Pesa payment flow
- **Voice Recording Modal** — Voice input with real-time transcription

---

## Primary Content and Functionality

### 1. Onboarding Screen
- **Content:** Welcome message, user type toggle (Founder/Regular), API key setup for founders
- **Functionality:** 
  - Set user type (determines token allocation)
  - For founders: Configure Grok API key
  - Skip button for quick start
  - Persist user type to AsyncStorage

### 2. Home (Arena) Screen
- **Content:**
  - Current level badge (Rookie, Contender, Pitcher, Closer, Elite)
  - Text input area for pitch
  - Voice input button (mic icon with recording state)
  - Submit button
  - Real-time character count
  - Token balance display (top-right)
- **Functionality:**
  - Accept text or voice input
  - Call Grok API for pitch transcription (if voice)
  - Call Grok API for pitch analysis (6-dimension scoring)
  - Display loading state during analysis
  - Show error handling for API failures
  - Deduct tokens on successful analysis
  - Redirect to feedback modal on completion

### 3. Levels Screen
- **Content:**
  - 5 level cards (Rookie → Elite)
  - Current level highlighted
  - XP progress bar for next level
  - Level description and unlock requirements
  - Drill prompts for each level
- **Functionality:**
  - Display XP needed for next level
  - Show locked/unlocked status
  - Tap to view level details and prompts
  - Track XP from pitch analysis

### 4. Coach Chat Screen
- **Content:**
  - Chat history (scrollable)
  - Message bubbles (user vs. coach)
  - Text input at bottom
  - Send button
- **Functionality:**
  - Send text to Grok API for conversational coaching
  - Display coaching responses
  - Deduct 1 token per message
  - Persist chat history to AsyncStorage
  - Show token balance warning when low

### 5. History Screen
- **Content:**
  - List of past pitches with:
    - Date/time
    - Overall score
    - 6-dimension scores (visual bars)
    - Pitch text preview
- **Functionality:**
  - Tap to view full feedback
  - Sort by date or score
  - Filter by level
  - Delete pitch history

### 6. Playbook Screen
- **Content:**
  - 8 collapsible sections:
    1. The Irresistible Hook
    2. Making the Pain Real
    3. The Obvious Solution
    4. Why Now — The Urgency Frame
    5. Credibility Without Arrogance
    6. The Perfect Close
    7. The 3 Pitch Lengths
    8. Voice, Body & Silence
  - Each section has icon, title, and detailed body text
- **Functionality:**
  - Expand/collapse sections
  - No token cost (always free)
  - Persist expanded state

### 7. Tokens Screen
- **Content:**
  - Token balance (large display)
  - Token usage breakdown (Analyze, Chat, Voice)
  - Token pack options:
    - Starter: 100 tokens for $2 (via M-Pesa)
    - Builder: 500 tokens for $8
    - Pro: 2000 tokens for $25
  - Purchase history
- **Functionality:**
  - Tap to purchase via M-Pesa
  - Show M-Pesa payment modal
  - Verify payment via backend
  - Credit tokens on successful payment
  - Display transaction history

### 8. Settings Screen
- **Content:**
  - User profile (name, email)
  - Theme toggle (Light/Dark)
  - Notification preferences
  - About section (version, links)
  - Logout button
- **Functionality:**
  - Toggle theme
  - Update notification settings
  - Logout and clear local data

### 9. Founder Terminal Screen
- **Content:**
  - M-Pesa configuration form:
    - Consumer Key
    - Consumer Secret
    - Shortcode
    - Passkey
  - User management (list of users, token allocation)
  - Analytics dashboard (total users, revenue, top pitchers)
- **Functionality:**
  - Save M-Pesa credentials securely
  - View and manage users
  - Manually allocate tokens to users
  - View analytics and reports

---

## Key User Flows

### Flow 1: New User Onboarding
1. User opens app → Onboarding screen
2. Select user type (Founder/Regular)
3. If Founder: Enter Grok API key
4. If Regular: Confirm token allocation (50 free tokens)
5. Navigate to Home (Arena) screen

### Flow 2: Pitch Analysis
1. User on Home screen
2. Enter pitch text OR tap mic for voice input
3. Tap "Analyze Pitch" button
4. App shows loading spinner
5. Grok API analyzes pitch (6 dimensions)
6. Deduct tokens (5 for analysis)
7. Show full feedback modal with:
   - Verdict (one-liner judgment)
   - Scores (hook, clarity, pain, solution, credibility, CTA)
   - What landed (specific strengths)
   - What killed (weaknesses)
   - Drill (specific exercise)
   - Rewrite (elite version of weakest line)
   - Next level (path to improvement)
8. User can save pitch to history or try again

### Flow 3: Token Purchase (M-Pesa)
1. User on Tokens screen, token balance low
2. Tap token pack (e.g., "Starter: 100 tokens for $2")
3. M-Pesa payment modal opens
4. User enters phone number
5. M-Pesa prompt sent to phone
6. User completes payment on phone
7. App verifies payment via backend
8. Tokens credited to account
9. Success message shown

### Flow 4: Founder Terminal Access
1. Founder logs in (user type = Founder)
2. Navigate to Settings → Founder Terminal
3. View M-Pesa configuration form
4. Enter/update credentials (Consumer Key, Secret, Shortcode, Passkey)
5. Save credentials (encrypted in backend)
6. View user list and analytics
7. Manually allocate tokens to users if needed

### Flow 5: Coach Chat
1. User on Coach Chat screen
2. Type question or request (e.g., "How do I open stronger?")
3. Tap Send
4. Grok API returns conversational coaching response
5. Deduct 1 token
6. Message added to chat history
7. User can continue conversation

---

## Color Choices (APEX Brand)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **Primary** | #c8432a | #e85d3c | Accent, buttons, highlights |
| **Background** | #ffffff | #0a0a0a | Screen background |
| **Surface** | #f5f4f1 | #1a1a1a | Cards, elevated surfaces |
| **Foreground** | #0a0a0a | #ffffff | Primary text |
| **Muted** | #888888 | #999999 | Secondary text |
| **Border** | #e0ddd8 | #333333 | Dividers, borders |
| **Gold** | #b8860b | #f0c040 | Premium, tokens, highlights |
| **Success** | #2a7a2a | #4aaa4a | Success states |
| **Error** | #c8432a | #e85d3c | Error states |

---

## Typography

- **Headings:** Syne (700-800 weight) — bold, commanding
- **Body:** DM Sans (400-500 weight) — clean, readable
- **Monospace:** System font for scores and metrics

---

## Interaction Patterns

### Mobile-First (Portrait 9:16)
- One-handed usage: buttons in lower half of screen
- Swipe-friendly tab navigation
- Large touch targets (min 48px)
- Haptic feedback on button press

### Loading States
- Spinner overlay during API calls
- Skeleton loaders for lists
- Disable buttons during submission

### Error Handling
- Toast notifications for errors
- Retry buttons for failed API calls
- Clear error messages

### Accessibility
- High contrast text
- Large font sizes (min 14px)
- Clear focus states
- Voice input as alternative to typing

---

## Technical Stack

- **Framework:** React Native with Expo
- **Styling:** NativeWind (Tailwind CSS)
- **State Management:** React Context + AsyncStorage
- **API:** Grok API for LLM and voice services
- **Payment:** M-Pesa via backend integration
- **Database:** PostgreSQL (optional, for user sync)
- **Authentication:** OAuth (optional, for multi-device)

---

## Success Metrics

- Users complete onboarding in <2 minutes
- Pitch analysis completes in <10 seconds
- Token purchases complete in <1 minute
- 80%+ of users reach Level 2 (Contender) within first week
- 50%+ of users return for second session
