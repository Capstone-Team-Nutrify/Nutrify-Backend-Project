import Joi from "joi";
import {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  updateProfile,
  getProfilePicture,
} from "../controllers/authControllers.js";

export default [
  {
    method: "POST",
    path: "/api/register",
    options: {
      auth: false,
      description: "Registrasi pengguna baru",
      tags: ["api", "auth"],
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required().description("Nama pengguna..."),
          email: Joi.string()
            .email()
            .required()
            .description("Email pengguna..."),
          password: Joi.string()
            .min(6)
            .required()
            .description("Password pengguna..."),
        }),
        failAction: "error",
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
    path: "/api/login",
    options: {
      auth: false,
      description: "Login pengguna",
      tags: ["api", "auth"],
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
        failAction: "error",
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
            accessToken: Joi.string().required(),
          }).example({
            status: "success",
            message: "Berhasil Login",
            accessToken: "...",
          }),
        },
      },
      handler: loginUser,
    },
  },
  {
    method: "POST",
    path: "/api/logout",
    options: {
      auth: { strategy: "jwt", mode: "required" },
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
    path: "/api/me",
    options: {
      auth: { strategy: "jwt", mode: "required" },
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
              profilePictureMimeType: Joi.string().allow(null).optional(),
              age: Joi.number().integer().min(0).allow(null).optional(),
              height: Joi.number().min(0).allow(null).optional(),
              weight: Joi.number().min(0).allow(null).optional(),
              role: Joi.string().valid("user", "moderator", "admin").required(),
              isVerified: Joi.boolean().required(),
              createdAt: Joi.string().isoDate().allow(null).required(),
              updatedAt: Joi.string().isoDate().allow(null).required(),
            }).required(),
          }),
        },
      },
      handler: currentUser,
    },
  },
  {
    method: "PUT",
    path: "/api/profile",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Update profil pengguna...",
      tags: ["api", "auth"],
      payload: {
        maxBytes: 5 * 1024 * 1024,
        output: "stream",
        parse: true,
        multipart: { output: "stream" },
        allow: ["application/json", "multipart/form-data"],
      },
      validate: {
        payload: Joi.object({
          age: Joi.number().integer().min(0).allow(null, "").optional(),
          height: Joi.number().min(0).allow(null, "").optional(),
          weight: Joi.number().min(0).allow(null, "").optional(),
          profilePicture: Joi.any()
            .optional()
            .allow(null, "")
            .meta({ swaggerType: "file" }),
        })
          .unknown(true)
          .options({ convert: true }),
        failAction: "error",
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success", "info").required(),
            message: Joi.string().required(),
            data: Joi.object({
              userId: Joi.string().required(),
              name: Joi.string().required(),
              age: Joi.number().integer().min(0).allow(null).required(),
              height: Joi.number().min(0).allow(null).required(),
              weight: Joi.number().min(0).allow(null).required(),
              updatedAt: Joi.string().isoDate().required(),
            }).optional(),
          }),
        },
      },
      handler: updateProfile,
    },
  },
  {
    method: "GET",
    path: "/api/profile-picture",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Dapatkan gambar profil pengguna...",
      tags: ["api", "auth"],
      handler: getProfilePicture,
    },
  },
];
