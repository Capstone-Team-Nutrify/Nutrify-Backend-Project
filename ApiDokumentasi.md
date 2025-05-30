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
    "message": "Registrasi berhasil"
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
  "message": "Email sudah terdaftar"
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
  "accessToken": "token jwt"
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
  "_id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "profilePictureData": "Buffer", // Data biner gambar
  "profilePictureMimeType": "string", // Tipe MIME (e.g., "image/png")
  "age": "number",
  "height": "number",
  "weight": "number",
  "isVerified": "boolean"
}
```

### GET /api/auth/me

- **Description**: Get current user details
- **Auth Required**: Yes
- **Request Body**: None

- **Response**: 200

```json
{
  "user": {
    "_id": "6832cbdea23729284f3801b4",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "hasProfilePicture": true,
    "age": 30,
    "height": 190,
    "weight": 70
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
    "message": "Profil berhasil diperbarui"
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

## Catatan
- **Autentikasi**: Semua titik akhir yang memerlukan autentikasi menggunakan JWT yang disimpan dalam cookie bernama `jwt`.
- **Unggahan Berkas**: Unggahan gambar profil dibatasi hingga 5 MB dan harus dalam format JPEG atau PNG.
