# Login Troubleshooting Guide

## Issue: Login works di local tapi gagal di Vercel dengan "password salah"

### Root Causes

1. **Firebase Project Berbeda**
   - Local menggunakan Firebase project A
   - Vercel menggunakan Firebase project B
   - Data tidak tersinkronisasi

2. **Environment Variables Tidak Konsisten**
   - `.env` di local berbeda dengan env vars di Vercel
   - Admin user di local tidak ada di Vercel

3. **Password Hash Format Berbeda**
   - Aplikasi menggunakan SHA-256 hashing yang konsisten
   - Tapi jika ada data lama dengan format hash berbeda, bisa error

### Solution

#### Step 1: Verify Firebase Configuration

**Di Local:**
```bash
# Buka file .env dan catat semua VITE_FIREBASE_* values
cat .env
```

**Di Vercel:**
1. Buka https://vercel.com/dashboard
2. Pilih project Anda
3. Settings → Environment Variables
4. Pastikan semua `VITE_FIREBASE_*` values **SAMA PERSIS** dengan local

#### Step 2: Reset Admin User (Jika Masih Gagal)

Jika env vars sudah sama tapi login masih gagal:

1. **Buka Firebase Console**
   - https://console.firebase.google.com
   - Pilih project yang digunakan

2. **Hapus semua users**
   - Firestore → Collection `users` → Delete semua documents
   - Atau gunakan Firebase CLI:
   ```bash
   firebase firestore:delete users --recursive
   ```

3. **Restart aplikasi**
   - Di local: `npm run dev`
   - Di Vercel: Trigger redeploy atau refresh page
   - Aplikasi akan auto-create admin user dengan:
     - Username: `admin`
     - Password: `admin123`

#### Step 3: Verify Login Works

**Di Local:**
```
Username: admin
Password: admin123
```

**Di Vercel:**
- Buka aplikasi di Vercel
- Coba login dengan credentials yang sama
- Jika berhasil, berarti sudah fixed

### Debugging Tips

**Lihat console logs:**
1. Di local: Buka browser DevTools → Console
2. Di Vercel: Buka browser DevTools → Console

**Cari logs yang dimulai dengan:**
- `🔐 Login attempt:` - Menunjukkan username/password yang dikirim
- `👥 Total users in DB:` - Menunjukkan berapa users di database
- `🔑 Password check:` - Menunjukkan hash comparison
- `✅ User validated:` - Login berhasil
- `❌ Password mismatch` - Password salah

### Prevention

1. **Gunakan `.env.local` untuk local development**
   ```bash
   cp .env.example .env.local
   # Edit .env.local dengan Firebase credentials
   ```

2. **Jangan commit `.env` atau `.env.local`**
   - Sudah ada di `.gitignore`

3. **Selalu set env vars di Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - Tambahkan semua `VITE_FIREBASE_*` variables

4. **Test setelah deploy**
   - Selalu test login di Vercel setelah deploy
   - Jangan assume akan sama dengan local

### Still Having Issues?

1. Check browser console untuk error messages
2. Check Vercel deployment logs
3. Verify Firebase project ID di console.firebase.google.com
4. Pastikan Firestore rules allow read/write (development mode)
