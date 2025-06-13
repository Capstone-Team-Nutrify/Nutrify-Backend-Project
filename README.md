
-----

# Nutrify Backend API

Repositori backend untuk Web Nutrify. Proyek ini menyediakan API untuk manajemen pengguna, autentikasi, pengelolaan data makanan, dan integrasi dengan model Machine Learning untuk prediksi nutrisi.

## Ringkasan Proyek

Nutrify adalah Web yang bertujuan untuk membantu pengguna memahami kandungan nutrisi dari berbagai makanan dan minuman, terutama dari Indonesia. Backend ini dibangun menggunakan Node.js dengan framework Hapi dan database MongoDB.

## Fitur Utama

  * **Autentikasi Pengguna**: Sistem registrasi, login, dan logout menggunakan JWT (JSON Web Tokens). Mendukung autentikasi melalui email/password dan Google OAuth 2.0.
  * **Manajemen Profil**: Pengguna dapat memperbarui informasi profil mereka, termasuk data pribadi dan foto profil.
  * **Manajemen Konten (CRUD)**: Pengguna dapat mengajukan data makanan baru. Admin dan Moderator dapat meninjau dan mengelola pengajuan tersebut.
  * **Kontrol Akses Berbasis Peran (RBAC)**: Terdapat tiga peran: `user`, `moderator`, dan `admin`, masing-masing dengan hak akses yang berbeda.
  * **Integrasi Machine Learning**: Terhubung dengan API eksternal untuk memprediksi informasi nutrisi dan potensi risiko penyakit berdasarkan bahan-bahan yang dimasukkan.
  * **Pencarian & Paginasi**: Fitur pencarian dan paginasi untuk memudahkan pengambilan data.

## Teknologi yang Digunakan

  * **Framework**: [Hapi.js](https://hapi.dev/)
  * **Database**: [MongoDB](https://www.mongodb.com/) dengan [Mongoose](https://mongoosejs.com/)
  * **Bahasa**: JavaScript (ESM)
  * **Autentikasi**: JSON Web Token (JWT), Google OAuth 2.0
  * **Validasi**: [Joi](https://joi.dev/)
  * **Deployment**: Google App Engine

## Memulai

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah di bawah ini.

### Prasyarat

  * Node.js (v22.x atau yang kompatibel)
  * NPM (Node Package Manager)
  * MongoDB (bisa lokal atau menggunakan layanan cloud seperti MongoDB Atlas)
  * Akun Google Cloud (untuk Google OAuth, jika diperlukan)

### Instalasi

1.  **Clone repositori:**

    ```sh
    git clone https://github.com/Capstone-Team-Nutrify/Nutrify-Backend-Project.git
    ```

2.  **Install dependensi proyek:**

    ```sh
    npm install
    ```

    Perintah ini akan mengunduh semua paket yang tercantum dalam file `package.json`.

### Konfigurasi Lingkungan

1.  Buat file `.env` di direktori root proyek. Anda bisa menyalin dari contoh di bawah ini:

    ```env
    # Server Configuration
    PORT=8080
    HOST=localhost
    NODE_ENV=development # Ganti menjadi 'production' saat deployment

    # Database
    DATABASE=mongodb://localhost:27017/nutrifyDB # Ganti dengan URI MongoDB Anda

    # JWT
    JWT_SECRET=rahasia_super_aman_dan_panjang # Ganti dengan secret key Anda sendiri

    # Google OAuth 2.0 Credentials
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
    GOOGLE_REDIRECT_DEV=http://localhost:8080/api/google/callback # Sesuaikan jika port berbeda
    # GOOGLE_REDIRECT_PROD=https://your-production-url/api/google/callback

    # Machine Learning API
    ML_API_URI=https://your-ml-api-endpoint.com/predict
    ```

2.  **Isi variabel lingkungan:**

      * `DATABASE`: Masukkan connection string untuk database MongoDB Anda.
      * `JWT_SECRET`: Ganti dengan string rahasia yang kuat untuk menandatangani token JWT.
      * `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Dapatkan dari Google Cloud Console saat Anda membuat kredensial OAuth 2.0.
      * `ML_API_URI`: Masukkan URL endpoint dari API Machine Learning yang akan digunakan.

### Menjalankan Proyek

  * **Mode Development (dengan Nodemon):**
    Perintah ini akan menjalankan server dan secara otomatis me-restart ketika ada perubahan pada file.

    ```sh
    npm run dev
    ```

  * **Mode Produksi:**
    Perintah ini akan menjalankan server menggunakan Node.

    ```sh
    npm run start
    ```

Setelah server berjalan, Anda akan melihat pesan di konsol:
`Server Berjalan di http://localhost:8080`

## Dokumentasi API

Proyek ini menggunakan `hapi-swagger` untuk membuat dokumentasi API yang interaktif. Anda dapat mengaksesnya melalui:

[Dokumentasi API](http://api.nutrify.web.id/documentation)

### Ringkasan Endpoint Utama

```
Berikut adalah beberapa endpoint utama yang tersedia:

+----------+--------------------------------------------------+------------------------------------------------------------------+-----------------+
| Metode   | Path                                             | Deskripsi                                                        | Autentikasi     |
+----------+--------------------------------------------------+------------------------------------------------------------------+-----------------+
| POST     | /api/register                                    | Mendaftarkan pengguna baru.                                      | Tidak           |
| POST     | /api/login                                       | Login pengguna dengan email dan password.                        | Tidak           |
| GET      | /api/google                                      | Mengarahkan ke halaman login Google.                             | Tidak           |
| GET      | /api/auth/google/callback                        | URL callback setelah login Google berhasil.                      | Tidak           |
| GET      | /api/profile                                     | Mendapatkan detail profil pengguna yang sedang login.            | Ya (JWT)        |
| PUT      | /api/profile                                     | Memperbarui profil pengguna.                                     | Ya (JWT)        |
| POST     | /predict                                         | Mengirim gambar untuk prediksi nutrisi.                          | Ya (JWT)        |
| GET      | /api/items                                       | Mendapatkan daftar semua item yang telah disetujui (publik).     | Tidak           |
| GET      | /api/items/name/{name}                           | Mendapatkan detail makanan berdasarkan namanya.                  | Tidak           |
| GET      | /api/items/id/{id}                               | Mendapatkan detail item berdasarkan ID uniknya.                  | Tidak           |
| GET      | /api/random-items                                | Mendapatkan beberapa item secara acak.                           | Tidak           |
| POST     | /api/items                                       | Mengajukan data makanan baru.                                    | Ya (JWT)        |
| GET      | /api/pending-items                               | (Admin/Mod) Mendapatkan daftar makanan yang menunggu persetujuan.| Ya (Admin/Mod)  |
| PATCH    | /api/pending-items/{pendingId}/approve           | (Admin/Mod) Menyetujui pengajuan makanan.                        | Ya (Admin/Mod)  |
| PATCH    | /api/pending-items/{pendingId}/reject            | (Admin/Mod) Menolak pengajuan makanan.                           | Ya (Admin/Mod)  |
| PATCH    | /api/items/{id}                                  | (Admin/Mod) Edit data item publik.                               | Ya (Admin/Mod)  |
| DELETE   | /api/items/{id}                                  | (Admin/Mod) Menghapus data item publik.                          | Ya (Admin/Mod)  |
| GET      | /api/users                                       | (Admin) Mendapatkan daftar semua pengguna.                       | Ya (Admin)      |
| GET      | /api/users/{id}                                  | (Admin) Mengambil detail informasi seorang pengguna.             | Ya (Admin)      |
| PATCH    | /api/users/{userIdToChange}/role                 | (Admin) Mengubah peran (role) pengguna.                          | Ya (Admin)      |
| DELETE   | /api/users/{userIdToDelete}                      | (Admin) Menghapus akun pengguna.                                 | Ya (Admin)      |
+----------+--------------------------------------------------+------------------------------------------------------------------+-----------------+
```


## Struktur Proyek

```
Nutrify-Backend-Project-main/
├── src/
│   ├── config/             # Konfigurasi server, database
│   ├── controllers/        # Logika bisnis untuk setiap route
│   ├── models/             # Skema database Mongoose
│   ├── plugins/            # Plugin Hapi (JWT, Swagger, Error Handling)
│   ├── routes/             # Definisi route dan validasi Joi
│   ├── services/           # Logika untuk berinteraksi dengan layanan eksternal (mis: ML API)
│   └── utils/              # Fungsi utilitas (mis: JWT helpers)
├── app.yaml                # Konfigurasi deployment Google App Engine
├── package.json            # Daftar dependensi dan skrip
└── server.js               # Entry point Web
```

-----