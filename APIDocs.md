## Nutrify API Docs

## Auth Collection

#### POST auth/register

- **Description**: Register new User
- **Auth Required**: No
- **Request Body**:

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
  "status": "fail",
  "message": "Email sudah terdaftar"
}
```

#### POST auth/login

- **Description**: Login User
- **Auth Required**: No
- **Request Body**:

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
  "accessToken": ""
}
```

## Users Collection

- Schema

```json
{
    "userId": string,
    "name": string,
    "email": string,
    "password": string,
    "profilePictureData": string,
    "profilePictureMimeType": string,
    "age": number,
    "height": number,
    "weight": number,
    "role": string, // "user", "admin"
    "isVerified": boolean,
    "createdAt": string,
    "updatedAt": string
}
```

#### GET /profile

- **Description**: Get current user profile
- **Auth Required**: Yes (JWT)
- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "userId": "user123",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "profilePictureData": "base64string",
    "profilePictureMimeType": "image/jpeg",
    "age": 25,
    "height": 175,
    "weight": 70,
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

#### PUT /profile

- **Description**: Update own profile (User)
- **Auth Required**: Yes (JWT)
- **Request Body**:

```json
{
  "name": "John Smith",
  "profilePictureData": "base64string",
  "profilePictureMimeType": "image/jpeg",
  "age": 26,
  "height": 180,
  "weight": 75
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "userId": "user123",
    "name": "John Smith",
    "age": 26,
    "height": 180,
    "weight": 75,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /users

- **Description**: Get list of all users (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Query Parameters**:

  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (optional)
  - `role`: string (optional)

- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "userId": "user123",
        "name": "John Doe",
        "email": "johndoe@gmail.com",
        "role": "user",
        "isVerified": true,
        "createdAt": "2024-01-15T08:00:00Z"
      }
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

#### GET /users/:userId

- **Description**: Get specific user details (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "userId": "user123",
    "name": "John Doe",
    "email": "johndoe@gmail.com",
    "age": 25,
    "height": 175,
    "weight": 70,
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-15T08:00:00Z"
  }
}
```

#### PUT /users/:userId

- **Description**: Update user profile (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Request Body**:

```json
{
  "name": "John Updated",
  "age": 30,
  "height": 180,
  "weight": 80,
  "role": "admin",
  "isVerified": true
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "userId": "user123",
    "name": "John Updated",
    "role": "admin",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### DELETE /users/:userId

- **Description**: Delete user account (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Response**: 200

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

#### POST /users/:userId/reset-password

- **Description**: Reset user password (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Request Body**:

```json
{
  "newPassword": "newpassword123"
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "Password reset successfully",
  "data": {
    "userId": "user123",
    "passwordResetAt": "2024-01-15T11:15:00Z"
  }
}
```

#### PUT /users/:userId/role

- **Description**: Change user role (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Request Body**:

```json
{
  "role": "admin"
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "User role updated successfully",
  "data": {
    "userId": "user123",
    "role": "admin",
    "updatedAt": "2024-01-15T11:20:00Z"
  }
}
```

## Food Collection

- Schema

```json
{
    "foodId": string,
    "name": string,
    "description": string,
    "imageUrl": string,
    "category": string,
        "ingredients": [
        {
            "ingredientAlias": "daging sapi mentah",
            "ingredientName": "Daging Sapi",
            "ingredientDose": "1000" // gram
        },
        {
            "ingredientAlias": "bawang putih",
            "ingredientName": "Bawang Putih",
            "ingredientDose": "100" // gram
        },
    ],
    "nutritionPer100g": {
        "kalori": number,
        "lemak": number,
        "karbohidrat": number,
        "gula": number,
        "protein": number,
        "serat": number,
        "kolesterol": number,
        "natrium": number,
        "air": number,
        "vitamin_A": number,
        "vitamin_B1": number,
        "vitamin_B11": number,
        "vitamin_B12": number,
        "vitamin_B2": number,
        "vitamin_B3": number,
        "vitamin_B5": number,
        "vitamin_B6": number,
        "vitamin_C": number,
        "vitamin_D": number,
        "vitamin_E": number,
        "vitamin_K": number,
        "kalsium": number,
        "zat_besi": number,
        "magnesium": number,
        "fosfor": number,
        "kalium": number,
        "zinc": number
    },
    "diesease rate": {
    "nama_makanan": "daging sapi mentah, bawang putih",
    "prediction": {
      "error": false,
      "message": "Prediksi berhasil",
      "predictions": {
        "Influenza": "Netral",
        "Liver": "Netral",
        "Diabetes": "Waspada",
        "Anemia": "Netral",
        "Diare": "Netral",
        "Batu_Ginjal": "Waspada",
        "Asma": "Netral",
        "Asam_Lambung": "Waspada",
        "Serangan_Jantung": "Waspada",
        "Asam_Urat": "Waspada",
        "Radang_Paru_paru": "Waspada",
        "Jerawat": "Waspada",
        "Hepatitis": "Netral",
        "Wasir": "Netral",
        "Sinusitis": "Netral",
        "Kolesterol": "Netral",
        "Usus_Buntu": "Netral",
        "Tifus": "Netral",
        "Osteoporosis": "Netral",
        "Malaria": "Netral",
        "Alergi_Dingin": "Netral",
        "Alergi_Kacang": "Netral",
        "Alergi_Seafood": "Netral",
        "Alergi_Susu": "Netral",
        "Alergi_Telur_Ayam": "Netral",
        "Alergi_Buah_Beri": "Konsumsi Wajar"
      }
    },
    "status": string, // "pending", "approved", "rejected"
    "submittedBy": string, // userId
    "submittedAt": string,
    "reviewedBy": string, // adminId
    "reviewedAt": string,
    "isPublic": boolean
}
```

```json
{
    "foodId": "1",
          "name": "Rendang",
      "nation": "Indonesia",
      "image": "/rendang.jpg",
      "category": "food",
      "description": "Rendang is a rich and tender coconut beef stew which is explosively flavorful and famous throughout Indonesia. Simmered in coconut milk and spices until the liquid evaporates, this dish is intensely flavorful with complex layers of taste from the various spices used in its preparation.",
      "origin": "Minangkabau, West Sumatra",
        "ingredients": [
        {
            "ingredientAlias": "daging sapi mentah",
            "ingredientName": "Daging Sapi",
            "ingredientDose": "1000" // gram
        },
        {
            "ingredientAlias": "bawang putih",
            "ingredientName": "Bawang Putih",
            "ingredientDose": "100" // gram
        },
    ],
    "nutritionPer100g": [ null ],
    "disease rate": {
    "nama_makanan": [ null ],
    "prediction": {
      "error": false,
      "message": "Prediksi berhasil",
      "predictions": [ null ]
    },
    "status": string,
    "submittedBy": string,
    "submittedAt": string,
    "reviewedBy": string,
    "reviewedAt": string,
    "isPublic": boolean
}
```

#### GET /food

#### GET /food/:foodId

- **Description**: Get specific food details by ID
- **Auth Required**: No
- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "foodId": "dwfwrwferf9w0f8tf32",
    "name": "Rendang",
    "description": "Traditional Indonesian spiced beef dish",
    "imageUrl": "https://example.com/rendang.jpg",
    "category": "Main Course",
    "nutritionPer100g": {
      "kalori": 468,
      "lemak": 35.2,
      "karbohidrat": 8.1,
      "protein": 28.5,
      "serat": 2.3
    },
    "ingredients": [
      {
        "ingredientAlias": "daging sapi mentah",
        "ingredientName": "Daging Sapi",
        "ingredientDose": "1000"
      },
      {
        "ingredientAlias": "santan kelapa",
        "ingredientName": "Santan Kelapa",
        "ingredientDose": "400"
      }
    ]
  }
}
```

- **Response**: 404

```json
{
  "status": "fail",
  "message": "Food not found"
}
```

#### POST /food

- **Auth Required**: Yes (JWT)
- **Description**: Submit new food for approval (User) or add directly to database (Admin)
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "name": "Nasi Gudeg",
  "description": "Traditional Javanese sweet and savory jackfruit dish",
  "imageUrl": "https://example.com/gudeg.jpg",
  "category": "Main Course",
  "nutritionPer100g": {
    "kalori": 150,
    "lemak": 8.5,
    "karbohidrat": 15.2,
    "protein": 5.8,
    "serat": 3.1,
    "kolesterol": 0,
    "natrium": 245,
    "vitamin_C": 12.5
  },
  "ingredients": [
    {
      "ingredientAlias": "nangka muda",
      "ingredientName": "Jackfruit",
      "ingredientDose": "500"
    },
    {
      "ingredientAlias": "santan kelapa",
      "ingredientName": "Coconut Milk",
      "ingredientDose": "200"
    }
  ]
}
```

- **Response (User)**: 201

```json
{
  "status": "success",
  "message": "Food submitted for approval",
  "data": {
    "foodId": "pending_abc123def456",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

- **Response (Admin)**: 201

```json
{
  "status": "success",
  "message": "Food added successfully",
  "data": {
    "foodId": "approved_xyz789ghi012",
    "status": "approved",
    "isPublic": true,
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /food

- **Description**: Get list of approved foods with pagination
- **Auth Required**: No
- **Query Parameters**:

  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `category`: string (optional)
  - `search`: string (optional)

- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "foods": [
      {
        "foodId": "dwfwrwferf9w0f8tf32",
        "name": "Rendang",
        "description": "Traditional Indonesian spiced beef dish",
        "imageUrl": "https://example.com/rendang.jpg",
        "category": "Main Course",
        "nutritionPer100g": {
          "kalori": 468,
          "protein": 28.5
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "limit": 10
    }
  }
}
```

#### GET /food/pending

- **Description**: Get list of pending food submissions (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Response**: 200

```json
{
  "status": "success",
  "data": {
    "pendingFoods": [
      {
        "foodId": "pending_abc123def456",
        "name": "Nasi Gudeg",
        "submittedBy": "user123",
        "submittedAt": "2024-01-15T10:30:00Z",
        "status": "pending"
      }
    ]
  }
}
```

#### PUT /food/:foodId/approve

- **Description**: Approve pending food submission (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Response**: 200

```json
{
  "status": "success",
  "message": "Food approved successfully",
  "data": {
    "foodId": "approved_abc123def456",
    "status": "approved",
    "reviewedAt": "2024-01-15T11:45:00Z"
  }
}
```

#### PUT /food/:foodId/reject

- **Description**: Reject pending food submission (Admin only)
- **Auth Required**: Yes (JWT)
- **Role Required**: Admin
- **Request Body**:

```json
{
  "reason": "Incomplete nutritional information"
}
```

- **Response**: 200

```json
{
  "status": "success",
  "message": "Food rejected",
  "data": {
    "foodId": "pending_abc123def456",
    "status": "rejected",
    "reason": "Incomplete nutritional information",
    "reviewedAt": "2024-01-15T11:45:00Z"
  }
}
```

### ML

#### POST /addingredients

- **Request Body**:
  ```json
  {
    "food": "example food name",
    "makanan": "nama makanan",
    "kalori": 250,
    "lemak": 15.5,
    "karbohidrat": 30.2,
    "gula": 12.1,
    "protein": 18.7,
    "serat": 5.3,
    "kolesterol": 45,
    "natrium": 320,
    "air": 65.4,
    "vitamin_A": 150,
    "vitamin_B1": 0.8,
    "vitamin_B11": 25,
    "vitamin_B12": 2.1,
    "vitamin_B2": 0.6,
    "vitamin_B3": 8.2,
    "vitamin_B5": 3.1,
    "vitamin_B6": 1.2,
    "vitamin_C": 45,
    "vitamin_D": 5.5,
    "vitamin_E": 12.3,
    "vitamin_K": 18,
    "kalsium": 120,
    "zat_besi": 2.8,
    "magnesium": 85,
    "fosfor": 180,
    "kalium": 420,
    "zinc": 3.5,
    "kepadatan_nutrisi": 0.85
  }
  ```

#### POST /predict

- **Description**: Get Ingredients Nutritions Classification
- **Request Body**:

```json
{
  "makanan": [
    {
      "bahan": "kaldu ayam",
      "dose": "300" //satuan gram
    },
    {
      "bahan": "kaldu ayam",
      "dose": "300" //satuan gram
    },
    {
      "bahan": "kaldu ayam",
      "dose": "300" //satuan gram
    }
  ]
}
```

- **Response**:200

```json
{
  "status": 200,
  "message": "success",
  "diesease rate": {
    "nama_makanan": "kaldu ayam",
    "prediction": {
      "error": false,
      "message": "Prediksi berhasil",
      "predictions": {
        "Influenza": "Netral",
        "Liver": "Netral",
        "Diabetes": "Waspada",
        "Anemia": "Netral",
        "Diare": "Netral",
        "Batu_Ginjal": "Waspada",
        "Asma": "Netral",
        "Asam_Lambung": "Waspada",
        "Serangan_Jantung": "Waspada",
        "Asam_Urat": "Waspada",
        "Radang_Paru_paru": "Waspada",
        "Jerawat": "Waspada",
        "Hepatitis": "Netral",
        "Wasir": "Netral",
        "Sinusitis": "Netral",
        "Kolesterol": "Netral",
        "Usus_Buntu": "Netral",
        "Tifus": "Netral",
        "Osteoporosis": "Netral",
        "Malaria": "Netral",
        "Alergi_Dingin": "Netral",
        "Alergi_Kacang": "Netral",
        "Alergi_Seafood": "Netral",
        "Alergi_Susu": "Netral",
        "Alergi_Telur_Ayam": "Netral",
        "Alergi_Buah_Beri": "Konsumsi Wajar"
      }
    },
    "nutrion_total": {
      "kalori": ""
    },
    "message": "Prediction successful and logged"
  }
}
```

#### POST /food/:foodId/classification

- **Description**: Send Signal to Backend to start Classification

#### POST /predict

-**Request Body**:

```json
  "ingredients": [
    {
      "ingredientAlias": "daging sapi mentah",
      "ingredientName": "Daging Sapi",
      "ingredientDose": "1000" //satuan gram
    },
    {
      "ingredientAlias": "garam",
      "ingredientName": "Garam"
    },
    {
      "ingredientAlias": "bawang putih",
      "ingredientName": "Bawang Putih"
    }
  ]
```

#### GET /food/:foodId

- **Description**: Get Food Details
- **Response **:

```json
{
  "foodId": "dwfwrwferf9w0f8tf32",
  "name": "Rendang",
  "description": "deskripsi makanan",
  "ingredients": [
    {
      "ingredientAlias": "daging sapi mentah",
      "ingredientName": "Daging Sapi",
      "ingredientDose": "1000" //satuan gram
    },
    {
      "ingredientAlias": "garam",
      "ingredientName": "Garam"
    },
    {
      "ingredientAlias": "bawang putih",
      "ingredientName": "Bawang Putih"
    }
  ]
}
```

creamcheese_kalori_total = (kalori_per_100g × (berat_dalam_gram / 100))
dagingsapi_kalori_total = (kalori_per_100g × (berat_dalam_gram / 100))
kalori_total

#### POST
