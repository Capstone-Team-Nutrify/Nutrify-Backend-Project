import { registerUser, loginUser } from '../controllers/authControllers.js';
import Joi from 'joi';

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
];
