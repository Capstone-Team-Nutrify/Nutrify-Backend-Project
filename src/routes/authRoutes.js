import { registerUser, loginUser, logoutUser, currentUser, updateProfile } from '../controllers/authControllers.js';
import Joi from 'joi';
import User from '../models/User.js';

export default [
  {
    method: 'POST',
    path: '/api/auth/register',
    options: {
      auth: false,
      description: 'Register a new user',
      tags: ['api', 'auth'],
      response: {
        status: {
          201: Joi.object({
            status: Joi.string().example('success'),
            message: Joi.string().example('Registrasi berhasil'),
          }),
          400: Joi.object({
            status: Joi.string().example('error'),
            message: Joi.string().example('Inputan harus berupa email, password min 6 karakter, name min 3 karakter'),
          }),
          409: Joi.object({
            status: Joi.string().example('error'),
            message: Joi.string().example('Email sudah terdaftar'),
          }),
        },
      },
      handler: registerUser,
    },
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    options: {
      auth: false,
      description: 'User login',
      tags: ['api', 'auth'],

      response: {
        status: {
          200: Joi.object({
            status: Joi.string().example('success'),
            message: Joi.string().example('Berhasil Login'),
            accessToken: Joi.string().description('JWT access token'),
          }),
          400: Joi.object({
            status: Joi.string().example('error'),
            message: Joi.string().example('Email dan password harus diisi'),
          }),
          401: Joi.object({
            status: Joi.string().example('error'),
            message: Joi.string().example('Email atau password salah'),
          }),
        },
      },
      handler: loginUser,
    },
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    options: {
      auth: {
        strategy: 'jwt',
        mode: 'required',
      },
      description: 'User logout',
      tags: ['api', 'auth'],
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
      tags: ['api', 'auth'],
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
      tags: ['api', 'auth'],
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
      tags: ['api', 'auth'],
      handler: async (request, h) => {
        const userId = request.auth.credentials.id;
        const user = await User.findById(userId).select('profilePictureData profilePictureMimeType');

        if (!user || !user.profilePictureData) {
          return h
            .response({
              status: 'error',
              message: 'Gambar profil tidak ditemukan',
            })
            .code(404);
        }

        return h.response(user.profilePictureData).type(user.profilePictureMimeType).header('Content-Length', user.profilePictureData.length);
      },
    },
  },
];
