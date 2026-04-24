# APEX Mobile App — Project TODO

## Phase 1: Core Architecture & Setup
- [ ] Fix TypeScript error in server/_core/storageProxy.ts
- [ ] Set up Grok API integration (environment variables)
- [ ] Set up M-Pesa payment integration (backend configuration)
- [ ] Create database schema for users, pitches, tokens, transactions
- [ ] Implement user authentication (Founder vs Regular user)
- [ ] Create AsyncStorage persistence layer

## Phase 2: Core Screens (MVP)
- [ ] Onboarding screen (user type selection, API key setup)
- [ ] Home (Arena) screen with text input
- [ ] Pitch feedback modal (6-dimension scoring display)
- [ ] Levels screen with XP tracking
- [ ] Tokens screen with balance display
- [ ] Settings screen with logout

## Phase 3: Voice Features
- [ ] Implement voice recording with expo-audio
- [ ] Integrate Grok API for speech-to-text
- [ ] Add voice input to Home screen
- [ ] Implement voice feedback playback (text-to-speech via Grok)
- [ ] Add voice recording indicator and UI

## Phase 4: AI Coaching Features
- [ ] Integrate Grok API for pitch analysis
- [ ] Implement 6-dimension scoring (Hook, Clarity, Pain, Solution, Credibility, CTA)
- [ ] Create coaching feedback system (verdict, drill, rewrite, next level)
- [ ] Implement Coach Chat screen with conversational AI
- [ ] Add Playbook screen with 8 coaching sections
- [ ] Implement drill suggestions and exercises

## Phase 5: Token Economy & Payment
- [ ] Implement token deduction system (Analyze: 5, Chat: 1, Voice: 3)
- [ ] Create token purchase flow (Starter, Builder, Pro packs)
- [ ] Integrate M-Pesa payment gateway
- [ ] Implement payment verification and token crediting
- [ ] Create transaction history tracking
- [ ] Add token balance warnings

## Phase 6: Founder Features (Direct Payment to Personal Account)
- [ ] Create Founder Terminal screen (founder-only access)
- [ ] Implement M-Pesa credential configuration form (personal account credentials)
- [ ] Add secure credential storage (SecureStore) for M-Pesa credentials
- [ ] Create user management interface
- [ ] Implement analytics dashboard (users, revenue, top pitchers)
- [ ] Add manual token allocation for users
- [ ] Implement direct payment routing (all payments → founder's personal M-Pesa account)
- [ ] Add payment verification and reconciliation

## Phase 7: History & Analytics
- [ ] Implement pitch history storage
- [ ] Create History screen with pitch list
- [ ] Add score visualization (charts/graphs)
- [ ] Implement filtering and sorting
- [ ] Add pitch deletion functionality
- [ ] Create performance trends view

## Phase 8: Branding & Polish
- [ ] Generate custom app logo
- [ ] Update app.config.ts with branding (name, logo, colors)
- [ ] Implement theme system (Light/Dark mode)
- [ ] Add splash screen
- [ ] Configure app icons for iOS/Android
- [ ] Add haptic feedback to interactions

## Phase 9: Testing & Optimization
- [ ] Unit tests for API integrations
- [ ] Integration tests for payment flow
- [ ] Performance testing (API response times)
- [ ] Error handling and edge cases
- [ ] Accessibility testing
- [ ] Cross-platform testing (iOS, Android, Web)

## Phase 10: Deployment & Documentation
- [ ] Create comprehensive README
- [ ] Document API integration steps
- [ ] Document M-Pesa setup for founders
- [ ] Create deployment guide
- [ ] Push to GitHub repository
- [ ] Generate APK and iOS build

---

## Known Issues
- TypeScript error in server/_core/storageProxy.ts (needs fixing)

---

## Completed Features
(None yet — tracking begins here)
