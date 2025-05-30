import Joi from 'joi';
import { getAllUsers, promoteUserToAdmin, deleteUserByAdmin } from '../controllers/adminControllers.js';

export default [
  {
    method: 'GET',
    path: '/api/admin/users',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Get list of all users (Admin only)',
      tags: ['api', 'admin'],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1).description('Nomor halaman'),
          limit: Joi.number().integer().min(1).max(100).default(10).description('Jumlah item per halaman (max 100)'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            data: Joi.object({
              users: Joi.array()
                .items(
                  Joi.object({
                    userId: Joi.string().required(),
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    role: Joi.string().valid('user', 'admin').required(),
                    isVerified: Joi.boolean().required(),
                    createdAt: Joi.string().isoDate().required(),
                  })
                )
                .required(),
              pagination: Joi.object({
                currentPage: Joi.number().integer().required(),
                totalPages: Joi.number().integer().required(),
                totalItems: Joi.number().integer().required(),
                limit: Joi.number().integer().required(),
              }).required(),
            }).required(),
          }),
        },
      },
      handler: getAllUsers,
    },
  },
  {
    method: 'PATCH',
    path: '/api/admin/users/{userIdToPromote}/promote',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Promote a user to admin role (Admin only)',
      tags: ['api', 'admin'],
      validate: {
        params: Joi.object({
          userIdToPromote: Joi.string().required().description('ID Pengguna yang akan dipromosikan menjadi admin'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success', 'info').required(),
            message: Joi.string().required(),
          }),
        },
      },
      handler: promoteUserToAdmin,
    },
  },
  {
    method: 'DELETE',
    path: '/api/admin/users/{userIdToDelete}',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Delete a user account (Admin only). Admins cannot delete other admins or themselves via this route.',
      tags: ['api', 'admin'],
      validate: {
        params: Joi.object({
          userIdToDelete: Joi.string().required().description('ID Pengguna yang akan dihapus'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
          }),
        },
      },
      handler: deleteUserByAdmin,
    },
  },
];
