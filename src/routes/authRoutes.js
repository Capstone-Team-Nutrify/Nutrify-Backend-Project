import Joi from "joi";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  currentUser, 
  updateProfile,
  getProfilePicture
} from "../controllers/authControllers.js";

export default [
  {
    method: "POST",
    path: "/api/auth/register",
    options: {
      auth: false,
      description: "Registrasi pengguna baru",
      tags: ["api", "auth"],
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required().description('Nama pengguna, minimal 3 karakter.'),
          email: Joi.string().email().required().description('Email pengguna yang valid.'),
          password: Joi.string().min(6).required().description('Password pengguna, minimal 6 karakter.'),
        }),
        failAction: 'error', 
      },
      response: {
        status: {
          201: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
          }).example({ status: "success", message: "Registrasi berhasil" }),
        },
      },
      handler: registerUser,
    },
  },
  {
    method: "POST",
    path: "/api/auth/login",
    options: {
      auth: false,
      description: "Login pengguna",
      tags: ["api", "auth"],
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().description('Email pengguna.'),
          password: Joi.string().required().description('Password pengguna.'),
        }),
        failAction: 'error',
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
            accessToken: Joi.string().required().description("JWT access token"),
          }).example({ status: "success", message: "Berhasil Login", accessToken: "your.jwt.token" }),
        },
      },
      handler: loginUser,
    },
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    options: {
      auth: {
        strategy: "jwt",
        mode: "required",
      },
      description: "Logout pengguna",
      tags: ["api", "auth"],
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
          }).example({ status: "success", message: "Logout berhasil" }),
        },
      },
      handler: logoutUser,
    },
  },
  {
    method: "GET",
    path: "/api/auth/me",
    options: {
      auth: {
        strategy: "jwt",
        mode: "required",
      },
      description: "Dapatkan detail pengguna saat ini",
      tags: ["api", "auth"],
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            user: Joi.object({
              _id: Joi.string().required(),
              name: Joi.string().required(),
              email: Joi.string().email().required(),
              hasProfilePicture: Joi.boolean().required(),
              age: Joi.number().integer().min(0).allow(null).optional(),
              height: Joi.number().min(0).allow(null).optional(),
              weight: Joi.number().min(0).allow(null).optional(),
              createdAt: Joi.string().isoDate().allow(null).required(), 
              updatedAt: Joi.string().isoDate().allow(null).required()
            }).required(),
          }),
        },
      },
      handler: currentUser,
    },
  },
  {
    method: "PUT",
    path: "/api/auth/profile",
    options: {
      auth: {
        strategy: "jwt",
        mode: "required",
      },
      description: "Update profil pengguna. Kirim string kosong atau null untuk mengosongkan field (age, height, weight, profilePicture).",
      tags: ["api", "auth"],
      payload: {
        maxBytes: 5 * 1024 * 1024, 
        output: "stream",
        parse: true,
        multipart: {
          output: "stream",
        },
        allow: ["application/json", "multipart/form-data"],
      },
      validate: {
        payload: Joi.object({
            age: Joi.number().integer().min(0).allow(null, '').optional().description('Usia pengguna (kosongkan untuk tidak mengubah, null/"" untuk menghapus).'),
            height: Joi.number().min(0).allow(null, '').optional().description('Tinggi badan pengguna dalam cm (kosongkan untuk tidak mengubah, null/"" untuk menghapus).'),
            weight: Joi.number().min(0).allow(null, '').optional().description('Berat badan pengguna dalam kg (kosongkan untuk tidak mengubah, null/"" untuk menghapus).'),
            profilePicture: Joi.any().optional().allow(null, '').meta({ swaggerType: 'file' }).description('File gambar profil (max 5MB). Kirim null atau string kosong untuk menghapus gambar profil yang ada.'),
        }).unknown(true).options({ convert: true }),
        failAction: 'error',
      },
      response: {
        status: {
          200: Joi.object({ 
            status: Joi.string().valid("success").required().example("success"),
            message: Joi.string().required().example("Profile updated successfully"),
            data: Joi.object({
                userId: Joi.string().required().example("user123"),
                name: Joi.string().required().example("John Smith"),
                age: Joi.number().integer().min(0).allow(null).required().example(26),
                height: Joi.number().min(0).allow(null).required().example(180),
                weight: Joi.number().min(0).allow(null).required().example(75),
                updatedAt: Joi.string().isoDate().required().example("2024-01-15T10:30:00Z")
            }).required()
          }),
       
        },
      },
      handler: updateProfile,
    },
  },
  {
    method: "GET",
    path: "/api/auth/profile-picture",
    options: {
      auth: {
        strategy: "jwt",
        mode: "required",
      },
      description: "Dapatkan gambar profil pengguna saat ini. Respons berupa binary gambar.",
      tags: ["api", "auth"],
    
      handler: getProfilePicture,
    },
  },
];