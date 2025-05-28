import { logoutUser, currentUser, updateProfile, getProfilePicture } from '../controllers/userControllers.js';
import Joi from 'joi';

export default [
  {
    method: 'POST',
    path: '/api/auth/logout',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'User logout',
      tags: ['api', 'profile'],
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().example('success'),
            message: Joi.string().example('Logout berhasil'),
          }),
        },
      },
      handler: logoutUser,
    },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Get current user details',
      tags: ['api', 'profile'],
      response: {
        status: {
          200: Joi.object({
            user: Joi.object({
              _id: Joi.string().required(),
              name: Joi.string().required(),
              email: Joi.string().email().required(),
              hasProfilePicture: Joi.boolean().required(),
              age: Joi.number().integer().allow(null),
              height: Joi.number().allow(null),
              weight: Joi.number().allow(null),
              role: Joi.string().valid('user', 'admin').required(),
            }).required(),
          }),
          401: Joi.object({
            statusCode: Joi.number().example(401).optional(),
            error: Joi.string().example('Unauthorized').optional(),
            message: Joi.string().example('Kredensial tidak valid atau belum login'),
            status: Joi.string().example('error').optional(),
          }),
        },
      },
      handler: currentUser,
    },
  },
  {
    method: 'PUT',
    path: '/api/auth/profile',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Update user profile',
      tags: ['api', 'profile'],
      payload: {
        maxBytes: 5 * 1024 * 1024,
        output: 'stream',
        parse: true,
        multipart: {
          output: 'stream',
        },
        allow: ['application/json', 'multipart/form-data'],
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().example('success'),
            message: Joi.string().example('Profil berhasil diperbarui'),
          }),
          400: Joi.object({
            status: Joi.string().example('error'),
            message: Joi.string().example('File harus berupa gambar (JPEG atau PNG)'),
          }),
          413: Joi.object({
            statusCode: Joi.number().example(413).optional(),
            error: Joi.string().example('Request Entity Too Large').optional(),
            message: Joi.string().example('Ukuran file tidak boleh melebihi 5MB'),
            status: Joi.string().example('error').optional(),
          }),
        },
      },
      handler: updateProfile,
    },
  },
  {
    method: 'GET',
    path: '/api/auth/profile-picture',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'Get user profile picture',
      tags: ['api', 'profile'],
      handler: getProfilePicture,
    },
  },
];
