import Joi from "joi";
import {
    getAllUsers,
    changeUserRole,
    deleteUserByAdmin
} from "../controllers/adminControllers.js";

export default [
  {
    method: "GET",
    path: "/api/admin/users",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Get list of all users (Admin only)",
      tags: ["api", "admin"],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(10),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            data: Joi.object({
              users: Joi.array().items(
                Joi.object({
                  userId: Joi.string().required(),
                  name: Joi.string().required(),
                  email: Joi.string().email().required(),
                  role: Joi.string().valid('user', 'moderator', 'admin').required(),
                  isVerified: Joi.boolean().required(),
                  createdAt: Joi.string().isoDate().allow(null).required() 
                })
              ).required(),
              pagination: Joi.object({
                currentPage: Joi.number().integer().required(),
                totalPages: Joi.number().integer().required(),
                totalItems: Joi.number().integer().required(),
                limit: Joi.number().integer().required()
              }).required()
            }).required()
          }),
        }
      },
      handler: getAllUsers,
    },
  },
  {
    method: "PATCH",
    path: "/api/admin/users/{userIdToChange}/role",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Change a user's role (Admin only). Allowed roles: user, moderator, admin.",
      tags: ["api", "admin"],
      validate: {
        params: Joi.object({
          userIdToChange: Joi.string().required().description('ID Pengguna...'),
        }),
        payload: Joi.object({
          newRole: Joi.string().valid('user', 'moderator', 'admin').required().description('Role baru...'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success", "info").required(),
            message: Joi.string().required(),
          }),
        }
      },
      handler: changeUserRole,
    },
  },
  {
    method: "DELETE",
    path: "/api/admin/users/{userIdToDelete}",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Delete a user account (Admin only)...",
      tags: ["api", "admin"],
      validate: {
        params: Joi.object({
          userIdToDelete: Joi.string().required().description('ID Pengguna...'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
          }),
        }
      },
      handler: deleteUserByAdmin,
    },
  },
];