import { allUsers } from "../controllers/userController.js";
import Joi from "joi";

export default [
  {
    method: "GET",
    path: "/api/users",
    options: {
      auth: {
        strategy: "jwt",
        scope: ["admin"],
      },
      description: "Get all users (admin only)",
      tags: ["api", "users"],
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().example("success"),
            data: Joi.object({
              users: Joi.array().items(
                Joi.object({
                  _id: Joi.string().description("User ID"),
                  name: Joi.string().description("User's name"),
                  email: Joi.string().description("User's email"),
                  role: Joi.string().description("User's role"),
                })
              ),
            }),
            message: Joi.string().example("Daftar pengguna berhasil diambil"),
          }),
          403: Joi.object({
            status: Joi.string().example("fail"),
            message: Joi.string().example("Anda tidak memiliki akses untuk melihat daftar pengguna"),
          }),
        },
      },
      handler: allUsers,
    },
  },
];
