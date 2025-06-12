# Dokumentasi API Nutrify

Dokumen ini menyediakan detail tentang semua endpoint API yang tersedia untuk backend aplikasi Nutrify.

## Catatan Umum

* **Autentikasi**: Sebagian besar endpoint memerlukan autentikasi menggunakan JWT (JSON Web Token). Token harus dikirim melalui cookie `jwt` (yang akan dibaca otomatis oleh server) atau sebagai `Bearer Token` di header `Authorization`.
* **Role & Hak Akses**:
    * `user`: Dapat mendaftar, login, mengelola profil sendiri, dan mengajukan data makanan baru (statusnya akan menjadi `pending`).
    * `moderator`: Memiliki semua hak `user`, ditambah kemampuan untuk mengajukan makanan baru yang langsung disetujui (`approved`), serta meninjau (menyetujui/menolak) pengajuan dari pengguna lain dan mengubah data item yang sudah publik.
    * `admin`: Memiliki semua hak `moderator`, ditambah kemampuan untuk mengelola data pengguna (melihat semua pengguna, mengubah role, menghapus pengguna).
* **Paginasi**: Endpoint yang mengembalikan daftar data (seperti `GET /api/items` atau `GET /api/users`) mendukung parameter query `page` dan `limit` untuk paginasi.
* **Unggahan File**: Unggahan gambar profil dibatasi hingga **5 MB** dan harus dalam format `JPEG` atau `PNG`.

## 1. Autentikasi & Profil

Endpoint yang berhubungan dengan registrasi, login, dan manajemen profil pengguna.

### **`POST /api/register`**

* **Deskripsi**: Mendaftarkan pengguna baru. Pengguna pertama yang mendaftar secara otomatis akan mendapatkan role `admin`.
* **Auth**: Tidak perlu.
* **Request Body**:
    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "password123"
    }
    ```
* **Response Sukses (201)**:
    ```json
    {
        "status": "success",
        "message": "Registrasi berhasil" 
    }
    ```
* **Response Error**:
    * `400 Bad Request`: Payload tidak valid.
    * `409 Conflict`: Email sudah terdaftar.

### **`POST /api/login`**

* **Deskripsi**: Login untuk mendapatkan `accessToken`.
* **Auth**: Tidak perlu.
* **Request Body**:
    ```json
    {
      "email": "johndoe@example.com",
      "password": "password123"
    }
    ```
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "message": "Berhasil Login",
      "accessToken": "your.jwt.token"
    }
    ```
* **Response Error**:
    * `401 Unauthorized`: Email atau password salah.

### **`POST /api/logout`**

* **Deskripsi**: Logout pengguna dengan menghapus cookie JWT.
* **Auth**: **Wajib** (JWT).
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "message": "Logout berhasil"
    }
    ```

### **`GET /api/google`**

* **Deskripsi**: Mengarahkan pengguna ke halaman autentikasi Google.
* **Auth**: Tidak perlu.
* **Response**: Redirect ke halaman login Google.

### **`GET /api/google/callback`**

* **Deskripsi**: Callback endpoint yang dipanggil Google setelah pengguna berhasil login. Server akan memproses kode otorisasi, membuat atau mengambil data pengguna, dan mengembalikan token JWT.
* **Auth**: Tidak perlu.
* **Response Sukses (200)**: Mengatur cookie `jwt` dan mengembalikan data pengguna.

### **`GET /api/profile`**

* **Deskripsi**: Mendapatkan detail profil dari pengguna yang sedang login.
* **Auth**: **Wajib** (JWT).
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "user": {
        "_id": "6832cbdea23729284f3801b4",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "user",
        "hasProfilePicture": true,
        "profilePictureMimeType": "image/png",
        "age": 30,
        "height": 175,
        "weight": 68,
        "isVerified": true,
        "createdAt": "2024-01-15T08:00:00.000Z",
        "updatedAt": "2024-01-16T10:30:00.000Z"
      }
    }
    ```

### **`PUT /api/profile`**

* **Deskripsi**: Memperbarui profil pengguna. Dapat mengirimkan data sebagai `multipart/form-data` untuk mengubah foto profil.
* **Auth**: **Wajib** (JWT).
* **Request Body** (`multipart/form-data`):
    * `name` (string, opsional)
    * `age` (number, opsional)
    * `height` (number, opsional)
    * `weight` (number, opsional)
    * `profilePicture` (file, opsional): File gambar (`JPEG`/`PNG`, maks 5MB). Untuk menghapus gambar, kirim nilai kosong atau `null`.
* **Response Sukses (200)**:
    ```json
    {
        "status": "success",
        "message": "Profile updated successfully",
        "data": {
            "userId": "6832cbdea23729284f3801b4",
            "name": "John Doe Updated",
            "age": 31,
            "height": 175,
            "weight": 68,
            "updatedAt": "2024-01-17T11:00:00.000Z"
        }
    }
    ```
* **Response Error**:
    * `413 Payload Too Large`: Ukuran file melebihi 5MB.
    * `422 Unprocessable Entity`: Tipe file tidak valid.

### **`GET /api/profile-picture`**

* **Deskripsi**: Mendapatkan file gambar profil dari pengguna yang sedang login.
* **Auth**: **Wajib** (JWT).
* **Response Sukses (200)**: `Content-Type` akan berupa `image/jpeg` atau `image/png`, dan body respons adalah data biner dari gambar.
* **Response Error**:
    * `404 Not Found`: "Gambar profil tidak ditemukan".

## 2. Manajemen Makanan & Minuman (Items)

Endpoint untuk mengelola data makanan dan minuman yang sudah disetujui dan bersifat publik.

### **`GET /api/items`**

* **Deskripsi**: Mendapatkan daftar semua makanan/minuman publik dengan paginasi dan pencarian.
* **Auth**: Tidak perlu.
* **Query Parameters**:
    * `search` (string, opsional): Kata kunci untuk mencari berdasarkan nama.
    * `page` (number, opsional, default: 1).
    * `limit` (number, opsional, default: 20).
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "message": "Daftar makanan dan minuman berhasil diambil.",
      "data": [
        {
          "id": "683be26522863fa4384dc37d",
          "name": "Ayam Betutu",
          "nation": "Indonesia",
          "origin": "Bali",
          "category": "food",
          "image": "[https://storage.googleapis.com/bucket-nutrify/ayam-betutu.jpg](https://storage.googleapis.com/bucket-nutrify/ayam-betutu.jpg)",
          "description": "Ayam Betutu is a traditional Balinese dish..."
        }
      ],
      "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 98, "limit": 20 }
    }
    ```

### **`GET /api/items/{name}`**

* **Deskripsi**: Mendapatkan detail spesifik dari sebuah item berdasarkan namanya. Pencarian nama bersifat *case-insensitive* dan harus sama persis.
* **Auth**: Tidak perlu.
* **Path Parameters**:
    * `name` (string, wajib): Nama item yang URL-encoded.
* **Response Sukses (200)**: Mengembalikan objek detail item, termasuk informasi nutrisi dan risiko penyakit.
* **Response Error**:
    * `404 Not Found`: "Makanan atau minuman tidak ditemukan.".

### **`GET /api/items/id/{id}`**

* **Deskripsi**: Mendapatkan detail spesifik dari sebuah item berdasarkan ID unik MongoDB.
* **Auth**: Tidak perlu.
* **Path Parameters**:
    * `id` (string, wajib): ID unik item.
* **Response Sukses (200)**: Sama seperti `GET /api/items/{name}`.
* **Response Error**:
    * `404 Not Found`: "Makanan atau minuman tidak ditemukan.".

### **`POST /api/items`**

* **Deskripsi**: Mengajukan data makanan/minuman baru.
    * Jika diajukan oleh `admin` atau `moderator`, item akan langsung disetujui (`approved`).
    * Jika diajukan oleh `user`, item akan masuk ke antrian moderasi (`pending`).
* **Auth**: **Wajib** (JWT).
* **Request Body**:
    ```json
    {
      "name": "Sate Ayam Madura",
      "nation": "Indonesia",
      "category": "food",
      "description": "Sate ayam dengan bumbu kacang khas Madura.",
      "image": "[https://example.com/sate.jpg](https://example.com/sate.jpg)",
      "origin": "Madura",
      "ingredients": [
        { "ingredientName": "Dada Ayam", "ingredientDose": "250" },
        { "ingredientName": "Kacang Tanah", "ingredientDose": "100" }
      ]
    }
    ```
* **Response Sukses (201)**:
    ```json
    {
      "status": "success",
      "message": "item submitted for approval", 
      "data": {
        "itemId": "6843a2b1c...", 
        "status": "approved", 
        "submittedAt": "2024-01-18T12:00:00.000Z"
      }
    }
    ```
* **Response Error**:
    * `409 Conflict`: "Data makanan dengan name ini mungkin sudah ada atau sedang diajukan.".

## 3. Moderasi (Admin & Moderator)

Endpoint khusus untuk `admin` dan `moderator` untuk mengelola item yang menunggu persetujuan.

### **`GET /api/pending-items`**

* **Deskripsi**: Mendapatkan daftar item yang berstatus `pending` dengan paginasi.
* **Auth**: **Wajib** (JWT, Role: `admin` atau `moderator`).
* **Query Parameters**: `page` (opsional, default: 1), `limit` (opsional, default: 10).
* **Response Sukses (200)**: Mengembalikan daftar ringkas item yang menunggu persetujuan.

### **`GET /api/pending-items/{pendingId}`**

* **Deskripsi**: Mendapatkan detail lengkap dari satu item yang `pending` berdasarkan ID-nya.
* **Auth**: **Wajib** (JWT, Role: `admin` atau `moderator`).
* **Path Parameters**: `pendingId` (string, wajib).
* **Response Sukses (200)**: Mengembalikan detail lengkap item, termasuk data `submittedBy`.

### **`PATCH /api/pending-items/{pendingId}/approve`**

* **Deskripsi**: Menyetujui sebuah item yang `pending`. Item tersebut akan dihapus dari koleksi `PendingItems` dan dibuat di koleksi `Items`.
* **Auth**: **Wajib** (JWT, Role: `admin` atau `moderator`).
* **Path Parameters**: `pendingId` (string, wajib).
* **Response Sukses (200)**:
    ```json
    {
        "status": "success",
        "message": "Makanan 'Nama Makanan' berhasil disetujui dan ditambahkan.",
        "data": {
            "itemId": "6842a9f6e32936dc053c08ed",
            "name": "Nama Makanan",
            "status": "approved"
        }
    }
    ```
* **Response Error**:
    * `400 Bad Request`: "Item ini sudah di-\[status], tidak bisa disetujui lagi.".
    * `409 Conflict`: Terjadi jika nama item yang disetujui sudah ada di koleksi utama. Pengajuan akan otomatis ditolak.

### **`PATCH /api/pending-items/{pendingId}/reject`**

* **Deskripsi**: Menolak sebuah item yang `pending`. Status item akan diubah menjadi `rejected`.
* **Auth**: **Wajib** (JWT, Role: `admin` atau `moderator`).
* **Path Parameters**: `pendingId` (string, wajib).
* **Request Body** (opsional):
    ```json
    {
      "rejectionReason": "Gambar tidak jelas atau bahan tidak lengkap."
    }
    ```
* **Response Sukses (200)**:
    ```json
    {
        "status": "success",
        "message": "Pengajuan makanan 'Nama Makanan' berhasil ditolak.",
        "data": {
            "pendingId": "6842ad47a37594839416c827",
            "name": "Nama Makanan",
            "status": "rejected",
            "rejectionReason": "Gambar tidak jelas atau bahan tidak lengkap."
        }
    }
    ```

### **`PATCH /api/items/{id}`**

* **Deskripsi**: Memperbarui data dari makanan/minuman yang sudah ada (publik). Jika `ingredients` diubah, maka data nutrisi dan risiko penyakit akan dihitung ulang secara otomatis.
* **Auth**: **Wajib** (JWT, Role: `admin` atau `moderator`).
* **Path Parameters**:
    * `id` (string, wajib): ID unik dari item yang akan diupdate.
* **Request Body** (opsional, kirim *field* yang ingin diubah saja):
    ```json
    {
      "name": "Sate Ayam Madura Spesial",
      "description": "Sate ayam dengan bumbu kacang khas Madura, kini lebih lezat.",
      "image": "[https://example.com/sate-baru.jpg](https://example.com/sate-baru.jpg)",
      "ingredients": [
        { "ingredientName": "Dada Ayam", "ingredientDose": "300" },
        { "ingredientName": "Kacang Tanah", "ingredientDose": "120" },
        { "ingredientName": "Bawang Merah", "ingredientDose": "20" }
      ]
    }
    ```
* **Response Sukses (200)**: Mengembalikan objek detail item yang sudah diperbarui.
    ```json
    {
        "status": "success",
        "message": "Item 'Sate Ayam Madura Spesial' berhasil diupdate.",
        "data": {
            "_id": "683be26522863fa4384dc37d",
            "name": "Sate Ayam Madura Spesial",
            "nation": "Indonesia",
            "origin": "Madura",
            "category": "food",
            "image": "[https://example.com/sate-baru.jpg](https://example.com/sate-baru.jpg)",
            "description": "Sate ayam dengan bumbu kacang khas Madura, kini lebih lezat.",
            "ingredients": [
              { "ingredientName": "Dada Ayam", "ingredientDose": "300" },
              { "ingredientName": "Kacang Tanah", "ingredientDose": "120" },
              { "ingredientName": "Bawang Merah", "ingredientDose": "20" }
            ],
            "nutrition_total": { "...data nutrisi baru..." },
            "disease_rate": [ "...data risiko penyakit baru..." ]
        }
    }
    ```
* **Response Error**:
    * `403 Forbidden`: Pengguna bukan `admin` atau `moderator`.
    * `404 Not Found`: Item dengan ID tersebut tidak ditemukan.
    * `409 Conflict`: Nama item yang baru sudah digunakan oleh item lain.
    * `503 Service Unavailable`: Gagal menghubungi layanan ML untuk menghitung ulang nutrisi.

## 4. Administrasi Pengguna (Admin Only)

Endpoint khusus untuk `admin` mengelola semua pengguna di sistem.

### **`GET /api/users`**

* **Deskripsi**: Mendapatkan daftar semua pengguna terdaftar dengan paginasi.
* **Auth**: **Wajib** (JWT, Role: `admin`).
* **Query Parameters**: `page` (opsional, default: 1), `limit` (opsional, default: 10).
* **Response Sukses (200)**: Mengembalikan daftar pengguna beserta data paginasi.
* **Response Error**:
    * `403 Forbidden`: "Akes ditolak. Hanya admin yang dapat mengakses sumber daya ini.".

### **`GET /api/users/{id}`**

* **Deskripsi**: Mengambil detail informasi seorang pengguna berdasarkan ID uniknya.
* **Auth**: **Wajib** (JWT, Role: `admin`).
* **Path Parameters**:
    * `id` (string, wajib): ID unik dari pengguna yang ingin dilihat detailnya.
* **Response Sukses (200)**:
    ```json
    {
        "status": "success",
        "user": {
            "_id": "68387a891d39b000c9d959c5",
            "name": "rafliAdmin",
            "email": "rafli.admin@gmail.com",
            "role": "admin",
            "hasProfilePicture": true,
            "profilePictureMimeType": "image/jpeg",
            "age": 20,
            "height": 170,
            "weight": 60,
            "isVerified": false,
            "createdAt": "2025-05-29T15:17:29.782Z",
            "updatedAt": "2025-06-06T12:43:29.569Z"
        }
    }
    ```
* **Response Error**:
    * `401 Unauthorized`: Token tidak valid atau tidak disediakan.
    * `403 Forbidden`: Pengguna yang mengakses bukan `admin`.
    * `404 Not Found`: Pengguna dengan ID tersebut tidak ditemukan.

### **`PATCH /api/users/{userIdToChange}/role`**

* **Deskripsi**: Mengubah role (`user`, `moderator`, `admin`) dari seorang pengguna.
* **Auth**: **Wajib** (JWT, Role: `admin`).
* **Path Parameters**: `userIdToChange` (string, wajib).
* **Request Body**:
    ```json
    {
      "newRole": "moderator"
    }
    ```
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "message": "Role pengguna John Doe berhasil diubah menjadi moderator."
    }
    ```
* **Response Error**:
    * `400 Bad Request`: "Admin tidak dapat mengubah role dirinya sendiri.".
    * `403 Forbidden`: "Admin tidak dapat menurunkan role admin lain.".
    * `404 Not Found`: Pengguna tidak ditemukan.

### **`DELETE /api/users/{userIdToDelete}`**

* **Deskripsi**: Menghapus akun pengguna. Admin tidak bisa menghapus akunnya sendiri atau akun admin lain.
* **Auth**: **Wajib** (JWT, Role: `admin`).
* **Path Parameters**: `userIdToDelete` (string, wajib).
* **Response Sukses (200)**:
    ```json
    {
      "status": "success",
      "message": "Pengguna Jane Doe berhasil dihapus."
    }
    ```
* **Response Error**:
    * `400 Bad Request`: "Admin tidak dapat menghapus akunnya sendiri.".
    * `403 Forbidden`: "Admin tidak diizinkan menghapus akun admin lain.".
    * `404 Not Found`: Pengguna tidak ditemukan.

## 5. Utilitas & Layanan Eksternal

Endpoint pendukung dan untuk interaksi dengan layanan Machine Learning.

### **`GET /api/display-ingredients`**

* **Deskripsi**: Mendapatkan daftar 50 bahan makanan dengan fungsionalitas pencarian. Berguna untuk form input.
* **Auth**: Tidak perlu.
* **Query Parameters**:
    * `search` (string, opsional): Kata kunci untuk mencari bahan.
* **Response Sukses (200)**: Mengembalikan daftar bahan.

### **`POST /predict`**

* **Deskripsi**: Endpoint internal atau untuk testing, yang berinteraksi langsung dengan API Machine Learning untuk mendapatkan prediksi nutrisi dan risiko penyakit. Fungsi ini sudah terintegrasi dalam alur `POST /api/items`.
* **Auth**: Tidak perlu.
* **Request Body**:
    ```json
    {
        "ingredients": [
            { "name": "kaldu ayam", "dose": 250 },
            { "name": "wortel mentah", "dose": 200 }
        ]
    }
    ```
* **Response Sukses (200)**: Mengembalikan hasil prediksi dari model ML.