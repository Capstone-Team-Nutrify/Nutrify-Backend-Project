import { registerUser, loginUser, logoutUser, currentUser } from '../controllers/authControllers.js';
import Joi from 'joi';

export default [
  {
    method: 'POST',
    path: '/api/auth/register',
    options: {
      auth: false,
      description: 'Register a new user',
      tags: ['api', 'auth'],
      validate: {
        payload: Joi.object({
          name: Joi.string().required().description("User's full name"),
          email: Joi.string().email().required().description("User's email address"),
          password: Joi.string().min(6).required().description("User's password"),
        }),
      },
      response: {
        status: {
          201: Joi.object({
            status: Joi.string().example('success'),
            data: Joi.object({
              user: Joi.object({
                _id: Joi.string().description('User ID'),
                name: Joi.string().description("User's name"),
                email: Joi.string().description("User's email"),
              }),
            }),
            message: Joi.string().example('Registrasi berhasil'),
          }),
          400: Joi.object({
            status: Joi.string().example('error'),
            data: Joi.any().allow(null),
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
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required().description("User's email address"),
          password: Joi.string().required().description("User's password"),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().example('success'),
            data: Joi.object({
              user: Joi.object({
                _id: Joi.string().description('User ID'),
                name: Joi.string().description("User's name"),
                email: Joi.string().description("User's email"),
              }),
            }),
            message: Joi.string().example('Login berhasil'),
          }),
          401: Joi.object({
            status: Joi.string().example('error'),
            data: Joi.any().allow(null),
            message: Joi.string().example('Kredensial tidak valid'),
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
            status: Joi.string().example('success'),
            data: Joi.object({
              user: Joi.object({
                _id: Joi.string().description('User ID'),
                name: Joi.string().description("User's name"),
                email: Joi.string().description("User's email"),
              }),
            }),
            message: Joi.string().example('User data berhasil diambil'),
          }),
          404: Joi.object({
            status: Joi.string().example('error'),
            data: Joi.any().allow(null),
            message: Joi.string().example('User tidak ditemukan'),
          }),
        },
      },
      handler: currentUser,
    },
  },
];
