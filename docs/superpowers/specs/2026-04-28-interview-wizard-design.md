# Design Document: Wizard Style Interview Redesign

**Date:** 2026-04-28  
**Feature:** Interview/Wawancara Page Redesign  
**Status:** Approved for Implementation  

---

## 1. Overview

### 1.1 Purpose
Redesign tampilan wawancara dari tab-based layout menjadi wizard-style layout untuk meningkatkan kemudahan navigasi dan fokus interviewer.

### 1.2 Goals
- ✅ Meningkatkan navigasi antar pertanyaan
- ✅ Menambahkan timer wawancara
- ✅ Memberikan visual feedback yang lebih baik
- ✅ Membuat tampilan lebih modern dan user-friendly
- ✅ Optimasi untuk mobile/tablet

### 1.3 Target Users
- HR/Recruiter yang melakukan wawancara
- Admin yang mereview hasil wawancara

---

## 2. Current State Analysis

### 2.1 Pain Points
1. **Tab navigation** - User harus klik tab kemudian pilih pertanyaan
2. **Rating buttons terlalu kecil** - Sulit diklik, kurang visual feedback
3. **Progress tidak jelas** - Tidak ada indikator berapa banyak yang sudah dikerjakan
4. **Tidak ada timer** - Interviewer tidak tahu berapa lama wawancara berlangsung
5. **Layout crowded** - Banyak informasi dalam satu layar

### 2.2 Current Tech Stack
- React 18 dengan Vite
- CSS custom (index.css + modern.css)
- Lucide React icons
- React Hot Toast
- React Router DOM

---

## 3. Proposed Design

### 3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] Interview: Nama Kandidat              [⏱️ 00:15:30] │
│ Posisi - Penempatan                                         │
├─────────────────────────────────────────────────────────────┤
│ [████████░░░░░░░░░░] 65% Complete                          │
│ Pertanyaan 15 dari 23                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 SECTION A - PENGALAMAN                          │   │
│  │ Pertanyaan 3 dari 5 dalam section ini              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │ 📋 KODE: A-003 | BOBOT: 2.5                        │   │
│  │                                                     │   │
│  │ "Berapa tahun pengalaman Anda dalam bidang         │   │
│  │  yang dilamar?"                                    │   │
│  │                                                     │   │
│  │ ┌──────┬──────┬──────┬──────┬──────┐               │   │
│  │ │  😟  │  😐  │  🙂  │  😊  │  🌟  │               │   │
│  │ │  SK  │  K   │  R   │  B   │  SB  │               │   │
│  │ │Sangat│Kurang│Rata2 │ Baik │Sangat│               │   │
│  │ │Kurang│      │      │      │ Baik │               │   │
│  │ │ 20.0 │ 40.0 │ 60.0 │ 80.0 │100.0 │               │   │
│  │ └──────┴──────┴──────┴──────┴──────┘               │   │
│  │                                                     │   │
│  │  [✅ Ada]    [❌ Tidak]                            │   │
│  │                                                     │   │
│  │  💬 Catatan Interviewer:                          │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │                                             │   │   │
│  │  │  Tulis catatan tambahan di sini...         │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📊 SKOR SEMENTARA                                   │   │
│  │                                                     │   │
│  │       ┌────────┐                                   │   │
│  │       │  65.5  │  Total Skor                        │   │
│  │       └────────┘                                   │   │
│  │                                                     │   │
│  │  A-Pengalaman:    ████░░░░ 16/20                   │   │
│  │  B-Administrasi:  ████░░░░ 12/20                   │   │
│  │  C-Hard Skill:    ████████ 20/20 ✓                 │   │
│  │  D-Soft Skill:    ░░░░░░░░ 0/20                    │   │
│  │  ...                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [< Sebelumnya]  [Lewati →]  [Simpan & Lanjut →]  [Selesai] │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown

#### A. Header Section
- **Back Button** - Kembali ke halaman kandidat
- **Candidate Info** - Nama, posisi, penempatan
- **Timer** - HH:MM:SS format dengan status warna

#### B. Progress Section
- **Progress Bar** - Visual bar dengan persentase
- **Step Counter** - "Pertanyaan X dari Y"
- **Completion Badge** - Status selesai/total

#### C. Question Card
- **Section Badge** - Warna section + nama
- **Question Counter** - "Pertanyaan X dari Y dalam section"
- **Meta Info** - Kode dan bobot
- **Question Text** - Pertanyaan dalam quote style
- **Rating Buttons** - 5 level dengan emoji dan score preview
- **Check Buttons** - Ada/Tidak toggle
- **Notes Textarea** - Catatan interviewer

#### D. Score Panel
- **Total Score** - Big number dengan color coding
- **Section Progress** - Progress bar per kategori
- **Real-time Update** - Update otomatis

#### E. Navigation Footer
- **Previous Button** - Kembali ke pertanyaan sebelumnya
- **Skip Button** - Lewati pertanyaan (orange)
- **Save & Next Button** - Simpan dan lanjut (primary)
- **Finish Button** - Muncul di pertanyaan terakhir

---

## 4. Timer Feature Specification

### 4.1 Timer States
| State | Condition | Visual |
|-------|-----------|--------|
| Running | Normal | Gray/Blue text |
| Paused | User pause | Yellow with pause icon |
| Warning | >30 minutes | Orange text |
| Critical | >45 minutes | Red text + pulse animation |

### 4.2 Timer Controls
- **Click** - Toggle pause/play
- **Right-click** - Reset with confirmation modal
- **Auto-save** - Timer state persist in localStorage

### 4.3 Timer Alerts
- 15 minutes - Toast notification
- 30 minutes - Warning color + toast
- 45 minutes - Critical color + toast
- 60 minutes - Auto-pause with confirmation

---

## 5. Interactions & Animations

### 5.1 Page Transitions
- **Duration:** 300ms
- **Effect:** Slide left/right atau fade
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### 5.2 Button Interactions
- **Hover:** Scale 1.02, shadow increase
- **Active:** Scale 0.98
- **Selected:** Border color + background highlight

### 5.3 Auto-save
- **Trigger:** On every answer change
- **Debounce:** 500ms
- **Storage:** localStorage
- **Toast:** "Jawaban tersimpan" (subtle)

### 5.4 Keyboard Navigation
| Key | Action |
|-----|--------|
| ← | Previous question |
| → | Next question |
| 1-5 | Select rating (1=SK, 5=SB) |
| A | Select "Ada" |
| T | Select "Tidak" |
| Space | Toggle timer pause/play |
| Esc | Open quick jump dropdown |

---

## 6. Responsive Design

### 6.1 Desktop (1024px+)
- Full layout as designed
- Score panel on right side
- Timer in header

### 6.2 Tablet (768px - 1023px)
- Score panel collapsible (toggle button)
- Timer compact mode
- Navigation buttons slightly smaller

### 6.3 Mobile (< 768px)
- Score panel becomes bottom sheet
- Navigation buttons full width, stacked
- Timer in header, compact
- Question card full width
- Rating buttons 2x3 grid

---

## 7. Color Scheme

### 7.1 Section Colors
```javascript
const SECTION_COLORS = {
  A: '#6366f1', // Indigo - PENGALAMAN
  B: '#10b981', // Emerald - ADMINISTRASI
  C: '#f59e0b', // Amber - HARD SKILL
  D: '#ef4444', // Red - SOFT SKILL
  E: '#8b5cf6', // Violet - PSIKOLOGI
  F: '#06b6d4', // Cyan - SALARY
  G: '#ec4899'  // Pink - ADD USER
};
```

### 7.2 Score Colors
- **High (≥70):** Green (#10b981)
- **Medium (60-69):** Orange (#f59e0b)
- **Low (<60):** Red (#ef4444)

### 7.3 Timer Colors
- **Normal:** Gray (#64748b)
- **Warning:** Orange (#f59e0b)
- **Critical:** Red (#ef4444)

---

## 8. Data Flow

### 8.1 State Management
```javascript
// Main state
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState({}); // { [categoryId]: { nilai, check_ada, keterangan } }
const [timer, setTimer] = useState({ seconds: 0, isRunning: true });
const [saving, setSaving] = useState(false);

// Derived state
const currentQuestion = questions[currentQuestionIndex];
const progress = (answeredCount / totalQuestions) * 100;
const totalScore = calculateTotalScore(answers);
```

### 8.2 Auto-save Flow
1. User selects answer
2. Debounce 500ms
3. Save to localStorage
4. Show subtle toast
5. Update answers state

### 8.3 Timer Flow
1. Start on component mount
2. Increment every second
3. Check thresholds (15, 30, 45, 60 min)
4. Persist state to localStorage
5. Resume on page reload

---

## 9. Error Handling

### 9.1 Save Errors
- **Retry:** 3x with exponential backoff
- **Fallback:** Keep in localStorage, show warning
- **Toast:** "Gagal menyimpan, mencoba lagi..."

### 9.2 Timer Errors
- **Fallback:** Use Date.now() difference
- **Recovery:** Sync on visibility change

### 9.3 Navigation Errors
- **Invalid question index:** Redirect to first/last
- **Missing data:** Show error state with retry

---

## 10. Accessibility

### 10.1 ARIA Labels
- Timer: `aria-label="Waktu wawancara: 15 menit 30 detik"`
- Rating buttons: `aria-label="Rating Sangat Kurang, 20 poin"`
- Progress: `aria-valuenow="65" aria-valuemax="100"`

### 10.2 Keyboard Support
- All buttons focusable
- Tab order: logical flow
- Escape: Open quick navigation

### 10.3 Screen Reader
- Announce question changes
- Announce score updates
- Timer announcements every 5 minutes

---

## 11. Performance Considerations

### 11.1 Optimizations
- **Lazy load:** Question data per section
- **Debounce:** Answer saves (500ms)
- **Memoization:** Score calculations
- **Virtualization:** If questions > 50

### 11.2 Bundle Size
- Reuse existing components
- No new heavy dependencies
- CSS-in-JS minimal

---

## 12. Testing Checklist

### 12.1 Functionality
- [ ] Timer starts on page load
- [ ] Timer pauses/resumes correctly
- [ ] Auto-save works
- [ ] Navigation buttons work
- [ ] Keyboard shortcuts work
- [ ] Score calculates correctly
- [ ] Progress bar updates

### 12.2 Responsive
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] Touch targets adequate

### 12.3 Edge Cases
- [ ] Refresh mid-interview
- [ ] All questions answered
- [ ] No questions in section
- [ ] Network failure on save
- [ ] Timer exceeds 60 minutes

---

## 13. Implementation Plan

### Phase 1: Core Structure
1. Create new AssessmentFormWizard component
2. Implement timer hook
3. Setup wizard navigation state

### Phase 2: UI Components
1. Header with timer
2. Progress bar
3. Question card
4. Rating buttons
5. Score panel
6. Navigation footer

### Phase 3: Features
1. Auto-save
2. Keyboard navigation
3. Responsive layout
4. Animations

### Phase 4: Polish
1. Error handling
2. Accessibility
3. Performance optimization
4. Testing

---

## 14. Files to Modify/Create

### New Files
- `src/pages/AssessmentFormWizard.jsx` - Main component
- `src/hooks/useInterviewTimer.js` - Timer logic
- `src/hooks/useAutoSave.js` - Auto-save logic
- `src/components/interview/Timer.jsx` - Timer component
- `src/components/interview/ProgressBar.jsx` - Progress component
- `src/components/interview/QuestionCard.jsx` - Question display
- `src/components/interview/RatingButtons.jsx` - Rating selector
- `src/components/interview/ScorePanel.jsx` - Score display
- `src/components/interview/NavigationFooter.jsx` - Nav buttons

### Modified Files
- `src/App.jsx` - Update route to new component
- `src/index.css` - Add wizard-specific styles
- `src/styles/modern.css` - Add component styles

---

## 15. Approval

**Design Approved By:** User  
**Date:** 2026-04-28  
**Status:** Ready for Implementation  

**Notes:**
- Wizard style dengan timer
- Fokus pada navigasi yang mudah
- Mobile-responsive
- Auto-save enabled

---

*Document Version: 1.0*  
*Next Step: Implementation via writing-plans skill*
