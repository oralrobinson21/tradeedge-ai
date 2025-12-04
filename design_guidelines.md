# CityTasks Mobile App - Design Guidelines

## Architecture

### Authentication & Accounts
**Required**: Apple Sign-In (iOS), Google Sign-In (Android), Email/password fallback

**Setup Flow:**
1. Role selection: "I'm posting tasks" (Customer) or "I'm helping out" (Worker)
2. Switchable via Profile > Role toggle
3. Profile: avatar, name, phone, payment methods (Customer), payout info (Worker)
4. Account deletion: Settings > Account > Delete Account (double confirm)

### Navigation Structure

**Unified Tab Bar (adapts by role):**

**Customer Mode:**
- Home → Posted tasks
- Messages → Worker chats
- FAB (center) → Create task
- Activity → History/payments
- Profile → Settings/role switch

**Worker Mode:**
- Jobs → Available paid tasks
- Messages → Customer chats
- FAB → Hidden/active timer
- My Jobs → Accepted tasks
- Profile → Settings/earnings

## Screen Specifications

### 1. Onboarding (Stack)
- Hero illustration: person helping neighbor
- Headline: "Get small jobs done. Help your neighbors."
- Buttons: "I need help with tasks" | "I want to earn money"
- Role confirmation → Auth

### 2. Home/Jobs Board (Main Tab)
**Header:** Transparent, search bar, filter icon, map toggle  
**Content:** Pull-to-refresh list  
**Insets:** Top: `headerHeight + 24px`, Bottom: `tabBarHeight + 24px`

**Job Card (Critical):**
```
┌─────────────────────────────┐
│ Task Title (16pt bold)   🟢 │ ← Green "Funded" badge (Worker view)
│ Neighborhood • 0.5mi (13pt) │
│ $20 (18pt bold, primary)    │
│ 🕐 Today, 2-5pm (13pt)      │
│ Brief description text...   │
└─────────────────────────────┘
```
- Shadow: `offset(0,1), opacity 0.08, radius 3`
- Press: scale 0.98, opacity 0.7
- Description: 2 lines max, truncated

**Empty States:**
- Customer: "Post your first task" button
- Worker: "No funded jobs nearby yet"

### 3. Create Task (Modal)
**Header:** Cancel | "Post a Task" | Next (disabled until valid)  
**Fields (order):**
1. Title (text, "e.g., Take 3 bags to curb")
2. Description (3 rows, "What needs to be done?")
3. Neighborhood (picker)
4. Price (currency, default $20, min $5)
5. Time window (date + range, default "Today, Next 3 hours")
6. Photo (optional)

**Flow:** Next → Payment Screen
- Shows: summary card, breakdown (task + 8% fee), Stripe card input
- Button: "Pay & Post Task" (sticky bottom)
- Success: modal → navigate Home

### 4. Task Detail (Stack)
**Header:** Back | Title (truncated) | Share/Bookmark  
**Content:**
- Status banner (full-width):
  - Green: "Funded - Waiting for helper"
  - Blue: "Worker on the way"
  - Gray: "Completed"
- Details card: title, description, neighborhood, price, time
- User info card (Customer/Worker based on role)
- Map: location pin
- **Action button (sticky):**
  - Worker: "Accept This Job" (primary)
  - Customer: "Message Worker" (secondary) or "Mark as Complete" (primary)

### 5. Messages Tab
**List Item:**
- Avatar | Name + task title (bold if unread) | Preview (14pt, gray, 1 line) | Timestamp | Badge

**Chat Screen:** Standard UI, keyboard-aware, header shows user name + task

### 6. My Jobs/Activity Tab
**Sections:**
- Active (assigned/in-progress)
- Completed (past 30 days)
- Posted (Customer only - unpaid/paid-waiting)

**Items:** Condensed job cards with status badge + timestamp

### 7. Profile/Settings Tab
**Top inset:** `safeArea.top + 24px`

**Layout:**
1. **Header:** Large avatar (tappable) | Name (editable) | Role badge | "Switch to [Role]" button
2. **Stats Row (Worker):** Jobs | Earnings | Rating
3. **Payment:** Payment Methods (Customer) / Payout Info (Worker)
4. **Settings:** Notifications, Privacy, Help, About
5. **Actions:** Log Out (red) | Delete Account

## Design System

### Colors
```
Primary:      #00B87C (green - funded/success)
Secondary:    #5B6EFF (blue - worker/progress)
Background:   #FFFFFF / #1C1C1E (dark)
Surface:      #F9FAFB / #2C2C2E (dark)
Text Primary: #1F2937 / #FFFFFF (dark)
Text Secondary: #6B7280 / #98989F (dark)
Error:        #EF4444
Success:      #10B981
```

### Typography
San Francisco (iOS) / Roboto (Android)
```
H1:          28pt Bold (screen titles)
H2:          22pt Semibold (sections)
Body Large:  16pt Regular (task titles)
Body:        14pt Regular (descriptions)
Body Small:  13pt Regular (metadata)
Caption:     11pt Regular (hints)
```

### Spacing
`xs:4px | sm:8px | md:12px | lg:16px | xl:24px | 2xl:32px | 3xl:48px`

### Components

**Primary Button:**
- 52px height, 12px radius, primary bg, white 16pt semibold
- Press: opacity 0.8, scale 0.98
- NO shadow (flat)

**FAB (Create):**
- 64x64px circle, primary gradient, white plus icon (24pt)
- Shadow: `offset(0,2), opacity 0.10, radius 2`
- Press: scale 0.95

**Card:**
- 16px radius, 16px padding, surface bg
- Border: 1px #E5E7EB (light only)
- Shadow: `offset(0,1), opacity 0.08, radius 3`

**Status Badges (28px pill, 12pt semibold):**
```
Funded:    bg #D1FAE5, text #065F46
Assigned:  bg #DBEAFE, text #1E40AF
Completed: bg #F3F4F6, text #4B5563
```

**Input Fields:**
- 48px height (single-line), 10px radius
- Border: 1.5px #D1D5DB, focus → primary
- Padding: 12px 16px, 16pt font (prevents iOS zoom)

### Icons
**Feather icons** (@expo/vector-icons)
- Standard: 24px, Tab bar: 26px, Small: 16px
- Stroke: 2px
- **Navigation:** home, message-circle, plus, user
- **Actions:** check, x, edit, trash-2, share-2, bookmark
- **Metadata:** map-pin, clock, dollar-sign, star
- **Filters:** filter, search, chevron-down

### Assets Required

**Illustrations (flat design, primary colors):**
1. Welcome hero: Two people exchanging task, neighborhood vibe
2. Empty tasks: Person with checklist + house
3. Empty jobs: Person with phone + location pin

**Avatars (6 preset, urban helper theme):**
- Diverse, casual/work attire, geometric style, 240x240px square (circular crop)
- Warm expressions, primary/secondary color palette

**Payment:** Stripe SDK handles UI/icons

### Accessibility (WCAG AA)
- Touchable areas: 44x44pt minimum
- High contrast text
- Dynamic Type support (scale fonts)
- VoiceOver labels on all interactive elements
- Status uses icons + text (not color alone)
- Form inputs: clear labels, error states
- Payment: step indicators