```markdown
## Nutrify API Docs

## Auth Collection

# Auth

### POST /api/register

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

### POST /api/login

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

### POST /api/logout

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

### GET /api/profile

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


### PUT /api/update-profile

- **Description**: Update user profile
- **Auth Required**: Yes
- **Untuk menghapus gambar profil, kirim profilePicture dengan string kosong "" atau null**
- **Request Body** (multipart/form-data):

```json
{
  "name": "lumere", //optional
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
        "name": "John Doe", 
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
  "message": "Ukuran file profil tidak boleh melebihi 5MB."
}
```


### GET /api/profile-picture

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

# Admin

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

## Items Collection

### Item Schema (Contoh Data Makanan/Minuman yang Disetujui)

```json
{
    "id": "string (MongoDB ObjectId)",
    "name": "string",
    "nation": "string",
    "catelogy": "string",
    "description": "string ",
    "image": "string (URL, opsional)",
    "origin": "string",
    "ingredients": [
        { "ingredientAlias": "string", "ingredientName": "string", "ingredientDose": "number" }
    ],
    "nutrisi_total": {
        // contoh field, bisa lebih banyak
        "calories": "number",
        "fat": "number",
        "carbohydrate": "number",
        "sugar": "number",
        "protein": "number",
        "fiber": "number",
        "cholesterol": "number",
        "sodium": "number",
        "water": "number"
        // ... struktur vitamin dan mineral jika didefinisikan detail
    },
    "disease_rate": [ 
        { "diease": "string", "status": "string", "level": "string" }
    ],
    "status" : "string",
    "submittedBy" : "string",
    "submittedAt": "string (ISO 8601 date)",
    "riviewedBy" : "string",
    "reviewedAt": "string (ISO 8601 date)",
    "ispublic" : "boolean"
}
```

### GET /api/items

- **Description**: mengambil semua data makanan
- **Auth Required**: NO
- **Query Parameters**:

  - `page`: (number, opsional, default: 1): Nomor halaman.
  - `limit`: (number, opsional, default: 20, max:100): Jumlah item per halaman.
  - `search`: (string, opsional): Kata kunci pencarian berdasarkan nama makanan.

- **Request Body**: No

- **Response**: 200

```json 
{
"status": "success",
    "message": "Daftar makanan dan minuman berhasil diambil.",
    "data": [
        {
            "id": "683be26522863fa4384dc37d",
            "name": "Ayam Betutu",
            "nation": "Indonesia",
            "category": "food",
            "description": "Ayam Betutu is a traditional Balinese dish made from whole chicken marinated in rich local spices, wrapped in banana leaves, and slow-cooked by grilling or steaming until tender and flavorful.",
            "image": "https://storage.googleapis.com/bucket-nutrify/ayam-betutu.jpg",
            "createdAt": null,
            "updatedAt": null
        }
        // ... more food items
    ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 24,
        "limit": 10
      }
}
```

### GET /api/items/{id}

- **Description**: Get details of a specific approved food item by ID.
- **Auth Required**: NO
- **path Parameters**:

  - `id`: (string, required): ID makanan atau minuman.

- **Request Body**: No

- **Response**: 200

```json
{
    "status": "success",
    "message": "Detail makanan atau minuman berhasil diambil.",
    "data": {
        "_id": "683be26522863fa4384dc371",
        "name": "Rendang",
        "nation": "Indonesia",
        "image": "https://storage.googleapis.com/bucket-nutrify/rendang.jpg",
        "category": "food",
        "description": "Rendang is a rich and tender coconut beef stew which is explosively flavorful and famous throughout Indonesia. Simmered in coconut milk and spices until the liquid evaporates, this dish is intensely flavorful with complex layers of taste from the various spices used in its preparation.",
        "origin": "Minangkabau, West Sumatra",
        "ingredients": 
            {
                "ingredientAlias": "",
                "ingredientName": "Lean beef",
                "ingredientDose": "1000"
            },
              // ... more ingredients
          "nutrition_total": {
            "calories": 195,
            "fat": 11.07,
            "carbohydrate": 4.49,
            "sugar": 1.31,
            "protein": 19.68,
            "fiber": 1.7,
            "cholesterol": 29,
            "sodium": 184,
            "water": 9,
            "vitamins": {
                "vitamin_A": 0.2,
                "vitamin_B1": 0.05,
                "vitamin_B2": 0.1,
                "vitamin_B3": 4.5,
                "vitamin_B5": 0.9,
                "vitamin_B6": 0.4,
                "vitamin_B9": 10,
                "vitamin_B12": 1.5,
                "vitamin_C": 0,
                "vitamin_D": 0,
                "vitamin_E": 0.2,
                "vitamin_K": 0
            },
            "minerals": {
                "calcium": 474,
                "iron": 14.9,
                "magnesium": 25,
                "phosphorus": 211,
                "potassium": 373,
                "zinc": 5.5
            }
        },
        "disease_rate": [
            {
                "disease": "High Cholesterol",
                "status": "CAUTION",
                "level": "The high content of saturated fat and cholesterol can increase the risk of heart disease if consumed excessively."
            },
            {
                "disease": "Hypertension",
                "status": "Moderate Consumption",
                "level": "The relatively high sodium content can contribute to high blood pressure if not controlled."
            }
        ],
        "status": "approved",
        "submittedBy": "N/A",
        "submittedAt": "2025-05-23T00:19:20.501Z",
        "reviewedBy": "N/A",
        "reviewedAt": "2025-05-23T00:19:20.501Z",
        "isPublic": true
    }
}
```

### POST /api/items

- **Description**: Tambahkan data makanan/minuman baru. Jika diajukan oleh admin/moderator, status langsung 'approved'. Jika oleh user biasa, status 'pending' dan masuk ke moderation queue.
- **Auth Required**: yes
- **Request Body**: 

```json 
{
  "name": "Ayam Bakar Madu Spesial",
  "nation": "Indonesia",
  "category": "food",
  "description": "Ayam bakar dengan bumbu madu meresap, disajikan dengan sambal dan lalapan segar. Cocok untuk makan siang.",
  "image": "https://example.com/ayam_bakar_madu.jpg",
  "origin": "indo",
  "ingredients": [
    {
      "ingredientName": "kaldu ayam",
      "ingredientDose": "250"
    },
    {
      "ingredientName": "wortel mentah",
      "ingredientDose": "200"
    },
    {
      "ingredientName": "nasi jagung",
      "ingredientDose": "100"
    }git
  ]
  // nutritionTotal dan diseaseRate akan diisi oleh server setelah prediksi ML
}
```

- **Response**: 201

```json 
{
  "status": "success",
  "message": "item added successfully", // atau "item submitted for approval"
  "data": {
    "itemId": "string (MongoDB ObjectId)", // ID dari item yang baru dibuat atau pending item
    "status": "approved", // atau "pending"
    "submittedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

### GET /api/pending-items

- **Description**: mengambil daftar item yang menunggu persetujuan dengan paginasi. Responsnya dibuat lebih ringkas untuk tampilan daftar.
- **Auth Required**: Yeah (JWT, role admin atau moderator)
- **Query Parameters**:

  - `page`: (number, opsional, default: 1): Nomor halaman yang ingin ditampilkan.
  - `limit`: (number, opsional, default: 10): Jumlah item per halaman.

- **Request Body**: No

- **Response**: 200
```json 
{
  "status": "success",
  "message": "Daftar makanan pending berhasil diambil.",
  "data": [
    {
      "pendingId": "6841e2f3a4b5c6d7e8f9a0b1",
      "name": "Nasi Goreng Spesial (Menunggu Persetujuan)",
      "category": "food",
      "description": "Nasi goreng dengan bumbu rahasia dan topping spesial yang menunggu untuk disetujui.",
      "image": "https://example.com/nasi-goreng-pending.jpg",
      "origin": "Indonesia",
      "submittedBy": "6841d1a2b3c4d5e6f7a8b9c0",
      "submittedAt": "2025-06-05T18:30:00.123Z",
      "status": "pending"
    },
    {
      "pendingId": "6841e2f3a4b5c6d7e8f9a0b2",
      "name": "Jus Alpukat Sehat (Menunggu Persetujuan)",
      "category": "drink",
      "description": "Jus alpukat segar tanpa gula yang menunggu untuk disetujui.",
      "image": "https://example.com/jus-alpukat-pending.jpg",
      "origin": "Indonesia",
      "submittedBy": "6841d1a2b3c4d5e6f7a8b9c1",
      "submittedAt": "2025-06-05T18:35:00.456Z",
      "status": "pending"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "limit": 10
  }
}
```

### GET /api/pending-items/{pendingId}

- **Description**: mengambil detail lengkap dari satu item pending berdasarkan ID-nya.
- **Auth Required**: Yeah (JWT, role admin atau moderator)
- **Path Parameters**:

  - `pendingId`: (string, wajib): ID unik dari item pending yang ingin dilihat detailnya.

- **Request Body**: No

- **Response**: 200
```json 
{
  "status": "success",
  "message": "Detail item makanan pending berhasil diambil.",
  "data": {
    "pendingId": "6841e2f3a4b5c6d7e8f9a0b1",
    "name": "Nasi Goreng Spesial (Menunggu Persetujuan)",
    "nation": "Indonesia",
    "category": "food",
    "description": "Nasi goreng dengan bumbu rahasia dan topping spesial yang menunggu untuk disetujui.",
    "image": "https://example.com/nasi-goreng-pending.jpg",
    "origin": "Indonesia",
    "ingredients": [
      {
        "ingredientName": "Nasi Putih",
        "ingredientDose": "200g",
        "ingredientAlias": null
      },
      {
        "ingredientName": "Telur Ayam",
        "ingredientDose": "1 butir",
        "ingredientAlias": ""
      }
    ],
    "nutrition_total": {
      "calories": 350,
      "fat": 15.5,
      "carbohydrate": 40.2,
      "sugar": 5.1,
      "protein": 12.8,
      "fiber": 2.1,
      "cholesterol": 186,
      "sodium": 590,
      "water": null,
      "vitamins": {
        "vitamin_A": 0.3,
        "vitamin_B9": 20
      },
      "minerals": {
        "calcium": 50,
        "iron": 2.5
      }
    },
    "disease_rate": [
      {
        "disease": "Hypertension",
        "warning": "CAUTION",
        "note": "Kandungan sodium yang tinggi dari kecap dan garam."
      }
    ],
    "status": "pending",
    "submittedBy": {
      "userId": "6841d1a2b3c4d5e6f7a8b9c0",
      "name": "User Biasa",
      "email": "user@example.com"
    },
    "submittedAt": "2025-06-05T18:30:00.123Z",
    "reviewNotes": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "pendingItemUpdatedAt": "2025-06-05T18:30:00.123Z"
  }
}
```


## Catatan
- **Autentikasi**: Semua titik akhir yang memerlukan autentikasi menggunakan JWT. Token dikirim via cookie jwt (dibaca otomatis oleh server) atau header Authorization: Bearer {token}.
- **Unggahan Berkas**: Unggahan gambar profil dibatasi hingga 5 MB dan harus dalam format JPEG atau PNG.
- **Role** : 
            - `user`: Bisa mengajukan makanan baru (status pending), mengelola profil sendiri.
            - `moderator`: Bisa mengajukan makanan baru (langsung approved), me-review (approve/reject) makanan pending.
            - `admin`: Semua hak moderator, ditambah mengelola pengguna (get all, change role, delete user).
