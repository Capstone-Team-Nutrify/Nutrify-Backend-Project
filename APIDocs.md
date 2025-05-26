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
