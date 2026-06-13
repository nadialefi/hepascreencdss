# Hepatitis C CDSS (Clinical Decision Support System)

Aplikasi ini merupakan sistem pendukung keputusan untuk skrining Hepatitis C menggunakan model Machine Learning (XGBoost).
Aplikasi terbagi menjadi dua bagian: **Backend (FastAPI)** dan **Frontend (Next.js)**.

## Prasyarat
- Python 3.9+
- Node.js 18+ (disarankan versi LTS terbaru)

## Instalasi dan Menjalankan Aplikasi

### 1. Backend (FastAPI)
Buka terminal baru dan jalankan:
```bash
cd d:\hepatitis_app\backend
# Aktifkan virtual environment
.\venv\Scripts\activate

# Jalankan server
uvicorn main:app --reload
```
Backend akan berjalan di `http://127.0.0.1:8000`. Database SQLite akan dibuat otomatis saat server pertama kali dijalankan.

### 2. Frontend (Next.js)
Buka terminal baru yang lain dan jalankan:
```bash
cd d:\hepatitis_app\frontend
# Jalankan server frontend
npm run dev
```
Frontend akan berjalan di `http://localhost:3000`.

### 3. Setup Pengguna Pertama
Karena ini pertama kali dijalankan, Anda perlu membuat akun admin/medis. Anda bisa menggunakan API Swagger UI:
1. Buka `http://127.0.0.1:8000/docs` di browser.
2. Cari endpoint `POST /api/v1/users/`.
3. Klik **Try it out**, masukkan JSON berikut, dan klik **Execute**:
```json
{
  "username": "admin",
  "role": "admin",
  "full_name": "Administrator",
  "password": "admin"
}
```
4. Setelah itu, buka `http://localhost:3000` dan login dengan username `admin` dan password `admin`.
5. Di Dashboard, Anda dapat membuat akun Tenaga Medis dari menu **Manajemen Pengguna**.
