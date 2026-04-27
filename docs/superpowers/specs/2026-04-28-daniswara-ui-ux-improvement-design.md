# Daniswara Recruitment System - UX/UI Improvement Design Document

**Date:** 2026-04-28  
**Project:** Daniswara Recruitment Management System  
**Type:** Evolutionary Redesign (Phase-based)  
**Style:** Bento Grid + Modern UX  

---

## 1. Executive Summary

### Goals
- Improve user experience dengan alur yang lebih intuitif dan fewer clicks
- Modernize UI dengan Bento Grid layout dan design system konsisten
- Add smooth animations dan micro-interactions
- Implement advanced UX features: onboarding, command palette, bulk operations, real-time updates

### Approach
**Evolutionary Redesign** - Upgrade bertahap per modul dengan risk minimal

### Timeline
3 weeks (Week 1: Foundation, Week 2: Components & Pages, Week 3: UX Features & Polish)

---

## 2. Design System

### 2.1 Color Palette

Primary colors dengan indigo/purple sebagai brand color, plus semantic colors untuk status.

### 2.2 Typography

Font Inter dengan scale dari 12px sampai 32px, weights 400-800.

### 2.3 Spacing System

Base unit 4px dengan scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.

### 2.4 Border Radius

sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, full: 999px.

### 2.5 Shadows

sm: subtle shadow untuk cards  
md: medium elevation  
lg: high elevation untuk modals  
xl: extreme elevation untuk overlays

---

## 3. Animation System

### 3.1 Timing Functions
- ease-out: cubic-bezier(0.16, 1, 0.3, 1)
- ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
- ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)

### 3.2 Durations
- Fast: 150ms (micro-interactions)
- Normal: 300ms (standard transitions)
- Slow: 500ms (page transitions)
- Entrance: 600ms (staggered animations)

### 3.3 Animation Patterns
- Fade Up: opacity 0 to 1, translateY 20px to 0
- Scale In: scale 0.95 to 1, opacity 0 to 1
- Slide In: translateX -20px to 0
- Stagger: 50ms delay between items

---

## 4. Component Library

### 4.1 New Components

#### BentoCard
Reusable card component dengan variants: Default, Gradient, Glass, Interactive.
Props: variant, title, children, onClick, className.

#### CommandPalette
Cmd+K interface untuk quick navigation dan actions.
Features: Fuzzy search, recent commands, keyboard navigation.

#### ToastNotification
Enhanced toast dengan progress bar, action buttons, multiple types.
Types: success, error, warning, info, loading.

#### DataTable
Advanced table dengan sorting, selection, pagination, empty states.
Features: Checkbox bulk select, sortable columns, loading skeleton.

#### FilterPanel
Slide-out panel untuk advanced filtering.
Features: Multiple filter types, save presets, active filter chips.

#### OnboardingTour
Guided tour untuk first-time users.
Features: Spotlight overlay, step indicators, skip option, progress persistence.

### 4.2 Enhanced Components

#### Sidebar
- Collapsible dengan smooth animation
- Active state indicator (pill shape)
- Tooltip saat collapsed
- Badge notifications

#### Topbar
- Global search trigger
- Notification bell dengan dropdown
- Quick action buttons
- Breadcrumb navigation

#### StatsCard
- Bento style dengan gradient icon background
- Trend indicator (up/down dengan persentase)
- Sparkline mini chart
- Hover: lift + shadow increase

---

## 5. Page Redesigns

### 5.1 Dashboard

**Layout:** Bento Grid 2 columns
- Welcome Card (greeting + quick stats)
- Quick Actions (shortcut buttons)
- Stats Cards (4 cards dalam 2x2 grid)
- Recent Candidates (table dengan actions)

**Features:**
- Personalized greeting dengan date
- Quick action buttons untuk actions sering digunakan
- Stats cards dengan count-up animation
- Recent table dengan avatar dan status badges

**Animations:**
- Staggered fade-up untuk cards (100ms delay)
- Count-up animation untuk numbers
- Card hover: lift 4px + shadow increase

### 5.2 Candidates Page

**Layout:**
- Header: Title + Search + Filter + Add Button
- Active Filters (chips)
- Data Table dengan checkbox selection
- Pagination + Bulk Actions Bar

**Features:**
- Real-time search dengan debounce
- Filter panel slide from right
- Bulk operations: select all, delete, export, change status
- Empty state dengan illustration
- Loading skeleton rows

**Row Actions:**
- View detail
- Edit
- Delete dengan confirmation
- Quick assess (modal)

### 5.3 Assessment Form

**Layout:** Step Wizard dengan Progress Bar
- Progress indicator steps
- Question Card (active question)
- Rating buttons
- Comment textarea
- Navigation: Prev / Save / Next

**Features:**
- Visual progress indicator
- Clear question hierarchy
- Visual rating buttons 1-5 dengan labels
- Auto-save indicator
- Keyboard support (arrow keys, Enter)

**Animations:**
- Question transition: Slide in from right
- Rating selection: Scale bounce
- Save indicator: Fade in/out
- Progress bar: Smooth width transition

### 5.4 Candidate Detail

**Layout:** Tab-based dengan Summary Sidebar
- Profile Card (avatar, info, status)
- Quick Stats (scores per kategori)
- Tab Content: Overview, Assessment History, Notes, Documents
- Actions (buttons)

**Features:**
- Large avatar dengan nama dan posisi
- Ringkasan nilai per kategori
- Timeline visual history
- Action buttons: Edit, Delete, Start Assessment, Export PDF

---

## 6. UX Enhancements

### 6.1 Onboarding Tour

**Steps:**
1. Welcome screen modal
2. Sidebar navigation highlight
3. Dashboard overview
4. Quick actions demo
5. Profile settings

**Features:**
- Skip anytime
- Don't show again checkbox
- Progress indicator
- Contextual tooltips

### 6.2 Command Palette

**Commands:**
- Navigation: Go to Dashboard, Candidates, etc.
- Actions: Add Candidate, Export Report, etc.
- Search: Find candidate by name
- Settings: Toggle theme, Logout

**Features:**
- Fuzzy search
- Recent commands
- Keyboard navigation
- Visual categories

### 6.3 Real-time Features

**Toast Notifications untuk:**
- New candidate added
- Assessment completed
- Status changed
- Export ready
- Error messages

**Live Updates:**
- Badge count di sidebar
- Status indicator di candidate list
- Someone is editing indicator

---

## 7. Polish & Optimization

### 7.1 Micro-interactions
- Button hover: Scale 1.02 + shadow
- Card hover: Lift 4px
- Input focus: Ring animation
- Loading: Skeleton shimmer
- Success: Checkmark animation

### 7.2 Responsive Improvements
- Mobile: Bottom navigation bar
- Tablet: Adjusted grid columns
- Touch targets: Min 44px

### 7.3 Accessibility
- Focus indicators
- ARIA labels
- Keyboard navigation
- Color contrast WCAG AA

---

## 8. Implementation Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| Week 1 | Foundation | Design system, Animation system, BentoCard, Toast |
| Week 1-2 | Global Components | CommandPalette, DataTable, FilterPanel, Onboarding |
| Week 2 | Dashboard & Candidates | Page redesigns dengan new components |
| Week 3 | Assessment & Detail | Form wizard, Detail page, Tabs |
| Week 3 | UX Features | Onboarding, Command Palette, Real-time |
| Week 3 | Polish | Micro-interactions, Responsive, A11y |

---

## 9. Success Criteria

- Lighthouse Performance Score > 90
- Lighthouse Accessibility Score > 95
- User dapat menyelesaikan task 30% lebih cepat
- Zero critical bugs post-launch
- Positive user feedback pada UI baru

---

## 10. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Phased rollout, extensive testing per phase |
| User resistance to change | Onboarding tour, gradual transition |
| Performance degradation | Lazy loading, code splitting, optimization |
| Browser compatibility | Test di Chrome, Firefox, Safari, Edge |

---

**Status:** Approved  
**Next Step:** Implementation Plan dengan writing-plans skill
