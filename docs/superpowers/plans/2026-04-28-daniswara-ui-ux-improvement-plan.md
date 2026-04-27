# Daniswara UI/UX Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement massive UI/UX improvements ke Daniswara Recruitment System dengan Bento Grid design, modern animations, dan advanced UX features (onboarding, command palette, bulk operations, real-time updates)

**Architecture:** Evolutionary redesign per modul - mulai dari design system dan components, lalu page redesigns, terakhir UX enhancements. Menggunakan React + Framer Motion untuk animations, Firebase untuk real-time features.

**Tech Stack:** React 19, Vite, Framer Motion, GSAP, Firebase, Tailwind-style CSS

**Design Doc:** `docs/superpowers/specs/2026-04-28-daniswara-ui-ux-improvement-design.md`

---

## File Structure Overview

### New Files to Create:
- `src/styles/design-system.css` - CSS variables dan utilities
- `src/components/ui/BentoCard.jsx` - Reusable card component
- `src/components/ui/CommandPalette.jsx` - Cmd+K interface
- `src/components/ui/ToastNotification.jsx` - Enhanced toast system
- `src/components/ui/DataTable.jsx` - Advanced table component
- `src/components/ui/FilterPanel.jsx` - Slide-out filter panel
- `src/components/ui/OnboardingTour.jsx` - Guided tour component
- `src/components/ui/Sparkline.jsx` - Mini chart untuk stats
- `src/components/ui/WelcomeCard.jsx` - Dashboard welcome card
- `src/components/ui/QuickActions.jsx` - Shortcut buttons
- `src/components/ui/StatsCard.jsx` - Enhanced stats card (Bento style)
- `src/hooks/useCommandPalette.js` - Hook untuk command palette
- `src/hooks/useOnboarding.js` - Hook untuk onboarding state
- `src/hooks/useRealtime.js` - Hook untuk Firebase real-time updates
- `src/hooks/useFilter.js` - Hook untuk filter logic
- `src/hooks/useBulkSelect.js` - Hook untuk bulk selection
- `src/utils/animations.js` - Animation variants dan configs
- `src/utils/notifications.js` - Toast notification helpers

### Files to Modify:
- `src/index.css` - Tambah design system variables
- `src/App.jsx` - Tambah CommandPalette provider
- `src/components/Layout.jsx` - Enhanced sidebar dan topbar
- `src/pages/Dashboard.jsx` - Bento grid redesign
- `src/pages/Candidates.jsx` - DataTable dengan bulk ops
- `src/pages/AssessmentFormWizard.jsx` - Improved wizard UX
- `src/pages/CandidateDetail.jsx` - Tab-based layout

---

## Phase 1: Foundation (Week 1)

### Task 1: Design System CSS Variables

**Files:**
- Create: `src/styles/design-system.css`
- Modify: `src/index.css`

- [ ] **Step 1: Create design-system.css dengan CSS variables**

Create file baru dengan semua CSS variables untuk colors, spacing, shadows, dan animations.

- [ ] **Step 2: Import design-system.css di index.css**

Tambahkan import di awal file index.css yang existing.

- [ ] **Step 3: Test design system variables**

Run dev server dan verify CSS variables tersedia di browser dev tools.

- [ ] **Step 4: Commit**

Commit dengan message yang jelas.

---

### Task 2: Animation Utilities

**Files:**
- Create: `src/utils/animations.js`

- [ ] **Step 1: Create animation utilities**

Buat file dengan export animation variants: fadeUp, fadeIn, scaleIn, slideIn, staggerContainer, staggerItem, cardHover, buttonHover, pageTransition, modalOverlay, modalContent.

- [ ] **Step 2: Commit**

---

### Task 3: BentoCard Component

**Files:**
- Create: `src/components/ui/BentoCard.jsx`

- [ ] **Step 1: Create BentoCard component**

Buat reusable card component dengan variants: default, gradient, glass, interactive. Support props: variant, title, children, onClick, className.

- [ ] **Step 2: Test BentoCard**

Import dan test di Dashboard page sementara.

- [ ] **Step 3: Commit**

---

### Task 4: Toast Notification System

**Files:**
- Create: `src/components/ui/ToastNotification.jsx`
- Create: `src/utils/notifications.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ToastNotification component**

Enhanced toast dengan progress bar, action buttons, types (success, error, warning, info, loading), stacking (max 3).

- [ ] **Step 2: Create notifications utility**

Helper functions: notify.success(), notify.error(), notify.warning(), notify.info(), notify.loading(), notify.dismiss().

- [ ] **Step 3: Integrate di App.jsx**

Tambah ToastNotification provider di root App.

- [ ] **Step 4: Test notifications**

Trigger test notifications dari Dashboard.

- [ ] **Step 5: Commit**

---

## Phase 2: Global Components (Week 1-2)

### Task 5: Command Palette

**Files:**
- Create: `src/hooks/useCommandPalette.js`
- Create: `src/components/ui/CommandPalette.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create useCommandPalette hook**

Hook untuk manage command palette state: isOpen, searchQuery, filteredCommands, recentCommands.

- [ ] **Step 2: Create CommandPalette component**

Modal dengan search input, fuzzy search, keyboard navigation (arrow keys, Enter), command categories.

- [ ] **Step 3: Integrate di App.jsx**

Tambah CommandPalette dan keyboard listener (Cmd+K).

- [ ] **Step 4: Define commands**

Commands untuk: Navigation (Go to Dashboard, Candidates, etc), Actions (Add Candidate, Export Report), Search (Find candidate).

- [ ] **Step 5: Test Command Palette**

Test Cmd+K shortcut dan navigation.

- [ ] **Step 6: Commit**

---

### Task 6: DataTable Component

**Files:**
- Create: `src/components/ui/DataTable.jsx`
- Create: `src/hooks/useBulkSelect.js`

- [ ] **Step 1: Create useBulkSelect hook**

Hook untuk manage bulk selection: selectedIds, selectAll, selectOne, isSelected, clearSelection.

- [ ] **Step 2: Create DataTable component**

Table dengan: sortable columns, checkbox selection, pagination, empty states, loading skeleton, row actions dropdown.

- [ ] **Step 3: Test DataTable**

Test dengan dummy data.

- [ ] **Step 4: Commit**

---

### Task 7: FilterPanel Component

**Files:**
- Create: `src/components/ui/FilterPanel.jsx`
- Create: `src/hooks/useFilter.js`

- [ ] **Step 1: Create useFilter hook**

Hook untuk filter logic: filters, setFilter, clearFilters, activeFiltersCount, applyFilters.

- [ ] **Step 2: Create FilterPanel component**

Slide-out panel dari kanan dengan: multiple filter types (text, select, date range, checkbox), save/load presets, clear all button, active filter chips.

- [ ] **Step 3: Test FilterPanel**

Test filtering dengan dummy data.

- [ ] **Step 4: Commit**

---

### Task 8: OnboardingTour Component

**Files:**
- Create: `src/components/ui/OnboardingTour.jsx`
- Create: `src/hooks/useOnboarding.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create useOnboarding hook**

Hook untuk manage onboarding state: isFirstTime, currentStep, completeStep, skipTour, hasCompletedTour.

- [ ] **Step 2: Create OnboardingTour component**

Guided tour dengan: spotlight overlay, step indicators, Skip/Next/Back buttons, progress persistence di localStorage.

- [ ] **Step 3: Define tour steps**

Steps: Welcome screen, Sidebar navigation, Dashboard overview, Quick actions demo, Profile settings.

- [ ] **Step 4: Integrate di App.jsx**

Tambah OnboardingTour component.

- [ ] **Step 5: Test Onboarding**

Clear localStorage dan test first-time experience.

- [ ] **Step 6: Commit**

---

## Phase 3: Page Redesigns (Week 2)

### Task 9: Dashboard Redesign

**Files:**
- Create: `src/components/ui/WelcomeCard.jsx`
- Create: `src/components/ui/QuickActions.jsx`
- Create: `src/components/ui/StatsCard.jsx`
- Create: `src/components/ui/Sparkline.jsx`
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Create WelcomeCard component**

Card dengan: personalized greeting, current date, quick tip/hint.

- [ ] **Step 2: Create QuickActions component**

Shortcut buttons untuk actions sering digunakan: Add Candidate, Start Assessment, Export Report.

- [ ] **Step 3: Create Sparkline component**

Mini chart untuk trend visualization di stats.

- [ ] **Step 4: Create StatsCard component**

Bento style card dengan: icon dengan gradient bg, value dengan count-up animation, label, trend indicator (up/down), sparkline mini chart.

- [ ] **Step 5: Redesign Dashboard page**

Bento Grid layout: Welcome Card + Quick Actions (top row), Stats Cards (2x2 grid), Recent Candidates table.

- [ ] **Step 6: Add animations**

Staggered fade-up untuk cards, count-up animation untuk numbers, card hover effects.

- [ ] **Step 7: Test Dashboard**

Verify semua components work correctly.

- [ ] **Step 8: Commit**

---

### Task 10: Candidates Page Redesign

**Files:**
- Modify: `src/pages/Candidates.jsx`

- [ ] **Step 1: Integrate DataTable**

Replace existing table dengan DataTable component.

- [ ] **Step 2: Add advanced search**

Real-time search dengan debounce.

- [ ] **Step 3: Integrate FilterPanel**

Tambah filter button yang membuka FilterPanel.

- [ ] **Step 4: Add bulk operations**

Bulk actions bar yang muncul saat ada selection: Delete selected, Export selected, Change status.

- [ ] **Step 5: Enhance empty state**

Tambah illustration dan CTA button.

- [ ] **Step 6: Add loading skeleton**

Skeleton rows saat loading.

- [ ] **Step 7: Test Candidates page**

Test search, filter, sort, bulk select, row actions.

- [ ] **Step 8: Commit**

---

### Task 11: Assessment Form Redesign

**Files:**
- Modify: `src/pages/AssessmentFormWizard.jsx`

- [ ] **Step 1: Enhance progress bar**

Visual progress indicator dengan step numbers dan labels.

- [ ] **Step 2: Improve question card**

Clear hierarchy, focused input state, better typography.

- [ ] **Step 3: Enhance rating buttons**

Visual buttons 1-5 dengan labels dan descriptions.

- [ ] **Step 4: Add auto-save indicator**

Show Saved status saat user pause typing.

- [ ] **Step 5: Add keyboard navigation**

Support arrow keys dan Enter untuk navigation.

- [ ] **Step 6: Add animations**

Question transition: slide in from right, rating selection: scale bounce, progress bar: smooth width transition.

- [ ] **Step 7: Test Assessment form**

Test flow, auto-save, keyboard nav.

- [ ] **Step 8: Commit**

---

### Task 12: Candidate Detail Redesign

**Files:**
- Modify: `src/pages/CandidateDetail.jsx`

- [ ] **Step 1: Create tab-based layout**

Tabs: Overview, Assessment History, Notes, Documents.

- [ ] **Step 2: Enhance profile card**

Large avatar, nama, posisi, status badge dengan better styling.

- [ ] **Step 3: Add quick stats**

Ringkasan nilai per kategori dengan visual indicators.

- [ ] **Step 4: Add timeline**

Visual history perubahan status.

- [ ] **Step 5: Enhance action buttons**

Edit, Delete, Start Assessment, Export PDF dengan icons.

- [ ] **Step 6: Add animations**

Tab switch: fade transition, stats: count-up on enter, timeline: staggered slide-in.

- [ ] **Step 7: Test Candidate Detail**

Test tabs, actions, responsiveness.

- [ ] **Step 8: Commit**

---

## Phase 4: UX Enhancements (Week 3)

### Task 13: Real-time Notifications

**Files:**
- Create: `src/hooks/useRealtime.js`
- Modify: `src/App.jsx`
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Create useRealtime hook**

Hook untuk Firebase real-time listeners: listenToCollection, unsubscribe.

- [ ] **Step 2: Add toast notifications**

Toast untuk: New candidate added, Assessment completed, Status changed, Export ready, Error messages.

- [ ] **Step 3: Add live badge counts**

Badge count di sidebar yang update real-time.

- [ ] **Step 4: Add status indicators**

Online/offline indicator di candidate list.

- [ ] **Step 5: Test real-time features**

Test dengan multiple browser tabs.

- [ ] **Step 6: Commit**

---

### Task 14: Enhanced Layout Components

**Files:**
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Enhance sidebar**

Collapsible dengan smooth animation, active state indicator (pill shape), tooltip saat collapsed, badge notifications.

- [ ] **Step 2: Enhance topbar**

Global search trigger, notification bell dengan dropdown, quick action buttons, breadcrumb navigation.

- [ ] **Step 3: Add mobile bottom navigation**

Bottom bar untuk mobile view.

- [ ] **Step 4: Test layout**

Test responsive behavior, sidebar collapse, mobile view.

- [ ] **Step 5: Commit**

---

## Phase 5: Polish & Optimization (Week 3)

### Task 15: Micro-interactions

**Files:**
- Modify: `src/index.css`
- Modify: Various component files

- [ ] **Step 1: Add button hover effects**

Scale 1.02 + shadow increase.

- [ ] **Step 2: Add card hover effects**

Lift 4px + shadow increase.

- [ ] **Step 3: Add input focus effects**

Ring animation dengan primary color.

- [ ] **Step 4: Add loading skeleton shimmer**

Shimmer animation untuk skeleton states.

- [ ] **Step 5: Add success checkmark animation**

Animated checkmark untuk success states.

- [ ] **Step 6: Test all interactions**

Verify smooth 60fps animations.

- [ ] **Step 7: Commit**

---

### Task 16: Responsive Improvements

**Files:**
- Modify: `src/index.css`
- Modify: Various page files

- [ ] **Step 1: Mobile optimizations**

Bottom navigation bar untuk mobile, adjusted grid columns untuk tablet.

- [ ] **Step 2: Touch targets**

Ensure semua interactive elements min 44px.

- [ ] **Step 3: Test responsive**

Test di 320px, 768px, 1024px, 1440px breakpoints.

- [ ] **Step 4: Commit**

---

### Task 17: Accessibility

**Files:**
- Modify: Various component files

- [ ] **Step 1: Add focus indicators**

Visible focus rings untuk keyboard navigation.

- [ ] **Step 2: Add ARIA labels**

Proper ARIA attributes untuk screen readers.

- [ ] **Step 3: Enhance keyboard navigation**

Ensure semua features accessible via keyboard.

- [ ] **Step 4: Check color contrast**

Verify WCAG AA compliance.

- [ ] **Step 5: Test accessibility**

Test dengan screen reader dan keyboard only.

- [ ] **Step 6: Commit**

---

### Task 18: Performance Optimization

**Files:**
- Modify: `vite.config.js`
- Modify: Various component files

- [ ] **Step 1: Code splitting**

Lazy load components dengan React.lazy.

- [ ] **Step 2: Optimize images**

Compress dan lazy load images.

- [ ] **Step 3: Bundle analysis**

Analyze bundle size dan optimize.

- [ ] **Step 4: Lighthouse audit**

Run Lighthouse dan fix issues.

- [ ] **Step 5: Commit**

---

## Summary

Total Tasks: 18
Estimated Time: 3 weeks
Files Created: ~20
Files Modified: ~10

### Success Criteria:
- Lighthouse Performance Score > 90
- Lighthouse Accessibility Score > 95
- User dapat menyelesaikan task 30% lebih cepat
- Zero critical bugs post-launch
- Positive user feedback pada UI baru

### Execution Options:

**1. Subagent-Driven (recommended)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session menggunakan executing-plans, batch execution dengan checkpoints

Pilih execution approach dan mulai implementasi.
