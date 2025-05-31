```markdown
## Nutrify API Docs

## Auth Collection

### POST /api/auth/register

- **Description**: Register a new user
- **Auth Required**: No
- **Request Body**: Yes

```json
{
  "name": "John Doe",
  "email": "johndoe@gmail.com",
  "password": "johndoe1234"
}
```

- **Response**: 201

```json
{
    "status": "success",
    "message": "Registrasi berhasil" // atau "Registrasi berhasil sebagai admin." jika user pertama
}
```

- **Response**: 400

```json
{
  "status": "error",
  "message": "Invalid request payload input"
}
```

- **Response**: 409

```json
{
  "status": "error",
  "message": "Email yang Anda masukkan sudah terdaftar"
}
```

### POST /api/auth/login

- **Description**: Login user
- **Auth Required**: No
- **Request Body**: Yes

```json
{
  "email": "johndoe@gmail.com",
  "password": "johndoe1234"
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "Berhasil Login",
  "accessToken": "your.jwt.token"
}
```

- **Response**: 400

```json
{
    "status": "error",
    "message": "Invalid request payload input"
}
```

- **Response**: 401

```json
{
    "status": "error",
    "message": "Email atau password Salah"
}
```

### POST /api/auth/logout

- **Description**: Logout user
- **Auth Required**: Yes
- **Request Body**: None

- **Response**: 200

```json
{
  "status": "success",
  "message": "Logout berhasil",
}
```

## Users Collection

### Schema

```json
{
  "_id": "string (MongoDB ObjectId)",
  "name": "string",
  "email": "string (unique)",
  "role": "string (enum: 'user', 'moderator', 'admin', default: 'user')",
  "profilePictureData": "Buffer", // Data biner gambar (tidak dikembalikan di list/detail user)
  "profilePictureMimeType": "string", // Tipe MIME (e.g., "image/png")
  "age": "number (opsional)",
  "height": "number (opsional)",
  "weight": "number (opsional)",
  "isVerified": "boolean (default: false)",
  "createdAt": "string (ISO 8601 date)",
  "updatedAt": "string (ISO 8601 date)"
}
```

### GET /api/auth/me

- **Description**: Get current user details
- **Auth Required**: Yes
- **Request Body**: None

- **Response**: 200

```json
{
  "status": "success",
  "user": {
    "_id": "6832cbdea23729284f3801b4",
    "name": "John Doe",
    "email": "johndoe@example.com",
    "hasProfilePicture": true,
    "profilePictureMimeType": "image/png", // atau null
    "age": 30, // atau null
    "height": 190, // atau null
    "weight": 70, // atau null
    "role": "user", // atau "admin", "moderator"
    "isVerified": false,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
    }
}
```


### PUT /api/auth/profile

- **Description**: Update user profile
- **Auth Required**: Yes
- **Request Body** (multipart/form-data):

```json
{
  "name": "rawr",
  "profilePicture": "file", // File gambar (JPEG atau PNG, max 5MB)
  "age": 30, // Opsional
  "height": 190, // Opsional
  "weight": 70 // Opsional
}
```


- **Response**: 200

```json
{
    "status": "success",
    "message": "Profile updated successfully", 
    "data": { 
        "userId": "6832cbdea23729284f3801b4",
        "name": "John Doe", // Nama tidak bisa diubah melalui endpoint ini
        "age": 30,
        "height": 175,
        "weight": 68,
        "updatedAt": "2024-01-16T10:30:00.000Z"
    }
}
```

- **Response**: 422

```json
{
  "status": "error",
  "message": "Tipe file tidak valid. Hanya file JPEG dan PNG yang diizinkan"
}
```


- **Response**: 413

```json
{
  "status": "error",
  "message": "Ukuran payload atau file terlalu besar dari yang diizinkan"
}
```


### GET /api/auth/profile-picture

- **Description**: Get user profile picture
- **Auth Required**: Yes
- **Request Body**: None

- **Response**: 200
  - **Content-Type**: `image/png`  
  - **Body**: Data biner gambar



- **Response**: 404

```json
{
  "status": "error",
  "message": "Gambar profil tidak ditemukan"
}
```

### GET /api/admin/users

- **Description**: Get list of all users (Admin only).
- **Auth Required**: Yes (JWT, Admin Role)
- **Query Parameters**:

  - `page`: (number, opsional, default: 1): Nomor halaman.
  - `limit`: (number, opsional, default: 10, max: 100): Jumlah item per halaman.

- **Request Body**: None

- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "userId": "user123",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "user",
        "isVerified": true,
        "createdAt": "2024-01-15T08:00:00.000Z"
      },
      {
        "userId": "user456",
        "name": "Jane Admin",
        "email": "janeadmin@example.com",
        "role": "admin",
        "isVerified": true,
        "createdAt": "2024-01-14T10:00:00.000Z"
      }
      // ... more users
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "limit": 10
    }
  }
}
```
- **Response**: 403 (Contoh: diakses oleh non-admin)

```json 
{
    "status": "fail",
    "message": "Akses ditolak. Hanya admin yang dapat mengakses sumber daya ini."
}
```

### PATCH /api/admin/users/{userIdToChange}/role

- **Description**: Get list of all users (Admin only).
- **Auth Required**: Yes (JWT, Admin Role)
- **Path Parameters**:

  - `userIdToChange`: (string, required): ID pengguna yang rolenya akan diubah.

- **Request Body**: Yes

```json 
{
  "newRole": "moderator" // atau "user", "admin"
}
```

- **Response**: 200

```json 
{
  "status": "success", 
  "message": "Role pengguna [Nama Pengguna] berhasil diubah menjadi [newRole]." // atau "Pengguna sudah memiliki role '[newRole]'. Tidak ada perubahan."
}
```
- **Response**: 400 (Contoh: role tidak valid, mencoba mengubah role diri sendiri)

```json 
{
    "status": "fail",
    "message": "Role target tidak valid. Pilih dari: user, moderator, admin" // atau "Admin tidak dapat mengubah role dirinya sendiri melalui endpoint ini."
}
```

- **Response**: 403 (Contoh: mencoba menurunkan role admin lain)

```json 
{
    "status": "fail",
    "message": "Admin tidak dapat menurunkan role admin lain melalui endpoint ini."
}
```

- **Response**: 404 (Contoh: user tidak ditemukan)

```json 
{
    "status": "fail",
    "message": "Pengguna yang akan diubah rolenya tidak ditemukan."
}
```

### DELETE /api/admin/users/{userIdToDelete}

- **Description**: Delete a user account (Admin only). Admin tidak bisa menghapus akun admin lain atau akunnya sendiri melalui endpoint ini.
- **Auth Required**: Yes (JWT, Admin Role)
- **Path Parameters**:

  - `userIdToDelete`: (string, required): ID pengguna yang akan dihapus.

- **Request Body**: No

- **Response**: 200

```json 
{
  "status": "success",
  "message": "Pengguna [Nama Pengguna] berhasil dihapus."
}
```

- **Response**: 400 (Contoh: mencoba menghapus diri sendiri)

```json 
{
    "status": "fail",
    "message": "Admin tidak dapat menghapus akunnya sendiri melalui endpoint ini."
}
```

- **Response**: 403 (Contoh: mencoba menghapus admin lain)

```json 
{
    "status": "fail",
    "message": "Admin tidak diizinkan menghapus akun admin lain."
}
```

- **Response**: 404 (Contoh: user tidak ditemukan)

```json 
{
    "status": "fail",
    "message": "Pengguna yang akan dihapus tidak ditemukan."
}
```

## Food Items Collection

### Food Item Schema (Contoh Data Makanan/Minuman yang Disetujui)

```json
{
    "id": "string (MongoDB ObjectId)",
    "nama": "string",
    "asal": "string (opsional)",
    "kategori": "string",
    "deskripsi": "string (opsional)",
    "foto_url": "string (URL, opsional)",
    "bahan": [
        { "nama": "string", "jumlah": "string", "alias": "string (opsional)" }
    ],
    "nutrisi_per_100g": {
        // contoh field, bisa lebih banyak
        "kalori": "number",
        "lemak": "number",
        "karbohidrat": "number",
        "protein": "number",
        "serat": "number",
        "kolesterol": "number",
        "natrium": "number",
        "vitamin_C": "number"
        // ... struktur vitamin dan mineral jika didefinisikan detail
    },
    "disease_rate": [ 
        { "penyakit": "string", "peringatan": "string", "catatan": "string" }
    ],
    "createdAt": "string (ISO 8601 date)",
    "updatedAt": "string (ISO 8601 date)"
}
```


## Catatan
- **Autentikasi**: Semua titik akhir yang memerlukan autentikasi menggunakan JWT. Token dikirim via cookie jwt (dibaca otomatis oleh server) atau header Authorization: Bearer {token}.
- **Unggahan Berkas**: Unggahan gambar profil dibatasi hingga 5 MB dan harus dalam format JPEG atau PNG.
- **Role** : 
            - `user`: Bisa mengajukan makanan baru (status pending), mengelola profil sendiri.
            - `moderator`: Bisa mengajukan makanan baru (langsung approved), me-review (approve/reject) makanan pending.
            - `admin`: Semua hak moderator, ditambah mengelola pengguna (get all, change role, delete user).
