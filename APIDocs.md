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
    "isVerified": boolean,

}
```

#### GET /profile

- **Description**: Register new User
- **Auth Required**: Yes
- **Request Body**:

```json

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
    "message": "Prediction successful and logged"
  }
}
```

#### GET /food/:foodId/classification

```json
["daging sapi mentah", "garam", "bawang putih"]
```

#### POST /predict

-**Request Body**:

```json
{
  "makanan": ["daging sapi mentah", "garam", "bawang putih"]
}
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
