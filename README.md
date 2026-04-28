# 🎯 Daniswara Recruitment System

Sistem manajemen rekrutmen modern berbasis web untuk mengelola kandidat, penilaian interview, dan laporan rekrutmen.

## ✨ Fitur Utama

### 📊 Dashboard
- Overview statistik kandidat (Total, Lulus, Lulus dengan Catatan, Tidak Lulus, Dalam Proses)
- Grafik visualisasi data rekrutmen
- Quick actions untuk akses cepat

### 👥 Manajemen Kandidat
- CRUD kandidat dengan informasi lengkap
- Upload foto kandidat
- Filter dan pencarian kandidat
- Export data ke Excel
- Status otomatis berdasarkan nilai assessment

### 📝 Sistem Penilaian
- Form penilaian wizard dengan 20 pertanyaan
- 7 kategori penilaian (A-G):
  - A: Pengalaman
  - B: Administrasi
  - C: Hard Skill
  - D: Soft Skill
  - E: Psikologi Interview
  - F: Salary & Prospektus Karir
  - G: Additional Questions
- Rating scale 1-5 dan checkbox Ada/Tidak
- Perhitungan skor otomatis berdasarkan bobot
- Timer untuk setiap sesi penilaian

### 📈 Laporan & Rekap
- Rekap nilai per kandidat
- Detail penilaian per assessor
- Collapsible view per kategori
- Export laporan ke Excel

### 👤 Manajemen User
- Role-based access control:
  - **Admin**: Full access
  - **HR**: Kelola kandidat, soal, dan penilaian
  - **Direktur**: Akses laporan dan penilaian
  - **Manager**: Akses laporan dan penilaian
  - **User**: Penilaian kandidat
- Secure password hashing (SHA-256)

### ⚙️ Pengaturan Sistem
- Reset semua data (Admin only)
- Kelola kategori soal
- Kustomisasi bobot penilaian

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📦 Instalasi

1. Clone repository:
```bash
git clone https://github.com/begolo12/REKRUITMENT-MAIN.git
cd REKRUITMENT-MAIN/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Setup Firebase:
   - Buat project di [Firebase Console](https://console.firebase.google.com/)
   - Copy konfigurasi Firebase ke `src/firebase.js`
   - Download service account key (untuk admin operations)
   - Simpan sebagai `rekrutment-[project-id]-firebase-adminsdk-[id].json` (file ini tidak akan di-commit)

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser di `http://localhost:5173`

## 🔐 Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **PENTING**: Segera ubah password default setelah login pertama kali!

## 📁 Struktur Project

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components (BentoCard, DataTable, etc.)
│   │   ├── interview/    # Interview-specific components
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Candidates.jsx
│   │   ├── AssessmentFormWizard.jsx
│   │   ├── Settings.jsx
│   │   └── ...
│   ├── services/         # API & database services
│   │   └── db.js
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions
├── public/               # Static assets
└── ...
```

## 🎨 Fitur UI/UX

- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Theme toggle support
- **Smooth Animations**: Framer Motion transitions
- **Modern UI**: Gradient cards, glassmorphism effects
- **Accessible**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: User-friendly feedback

## 📊 Sistem Scoring

Perhitungan skor menggunakan formula Excel:

- **Check (Ada/Tidak)**: `score = bobot × 100`
- **Rating (1-5)**: `score = bobot × multiplier × 100`

Rating Multipliers:
- Sangat Kurang (1): 0.2
- Kurang (2): 0.4
- Rata-rata (3): 0.6
- Baik (4): 0.8
- Sangat Baik (5): 1.0

Status Kandidat:
- **Lulus**: Rata-rata ≥ 70
- **Lulus dengan Catatan**: 60 ≤ Rata-rata < 70
- **Tidak Lulus**: Rata-rata < 60

## 🚀 Deployment

### Build untuk production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Deploy ke Vercel:
```bash
vercel --prod
```

## 🔒 Security Notes

- ⚠️ File `*firebase-adminsdk*.json` berisi kredensial sensitif dan sudah di-exclude dari git
- Password di-hash menggunakan SHA-256
- Role-based access control untuk semua endpoint
- Input validation dan sanitization

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 👨‍💻 Developer

Developed with ❤️ by Daniswara Team

---

**Note**: Pastikan untuk tidak meng-commit file kredensial Firebase ke repository public!
