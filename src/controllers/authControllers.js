
/* eslint-disable no-unused-vars */
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '6d',
  });
};

const setCookieWithToken = (h, token) => {
  return h.state('jwt', token, {

    ttl: 6 * 24 * 60 * 60 * 1000,
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    encoding: 'none',
    isSameSite: 'Lax',
    path: '/',
  });
};

export const registerUser = async (request, h) => {
  try {
    const { name, email, password } = request.payload;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return h
        .response({
          status: 'error',
          message: 'Email sudah terdaftar',
        })
        .code(409);

    }

   
    const user = await User.create({ name, email, password, role }); 
    const token = generateToken(user._id.toString());
    const response = h
      .response({
        status: 'success',
        message: 'Registrasi berhasil',
      })
      .code(201);
    return setCookieWithToken(response, token);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return h
        .response({
          status: 'error',
          message: 'Inputan harus berupa email, password min 6 karakter, name min 3 karakter',
        })
        .code(400);
    }

    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    if (err.name === 'JsonWebTokenError') {
      return h
        .response({
          status: 'error',
          message: 'Token tidak valid atau belum login',
        })
        .code(401)
        .unstate('jwt');
    }

    if (err.name === 'TokenExpiredError') {
      return h
        .response({
          status: 'error',
          message: 'Token sudah kedaluwarsa',
        })
        .code(401)
        .unstate('jwt');
    }

    return h
      .response({
        status: 'error',
        message,
      })
      .code(statusCode);

  }
};

export const loginUser = async (request, h) => {
  try {

    const { email, password } = request.payload;

    if (!email || !password) {
      return h
        .response({
          status: 'error',
          message: 'Email dan password harus diisi',
        })
        .code(400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return h
        .response({
          status: 'error',
          message: 'Email atau password salah',
        })
        .code(401);
    }

    const token = generateToken(user._id.toString());
    const response = h
      .response({
        status: 'success',
        message: 'Berhasil Login',
        accessToken: token,
      })
      .code(200);


  } catch (err) {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    if (err.name === 'JsonWebTokenError') {
      return h
        .response({
          status: 'error',
          message: 'Token tidak valid',
        })
        .code(401)
        .unstate('jwt');
    }

    if (err.name === 'TokenExpiredError') {
      return h
        .response({
          status: 'error',
          message: 'Token sudah kedaluwarsa',
        })
        .code(401)
        .unstate('jwt');
    }

    return h
      .response({
        status: 'error',
        message,
      })
      .code(statusCode);

  }
};

export const logoutUser = (request, h) => {
  try {
    return h
      .response({
        status: 'success',
        message: 'Logout berhasil',
      })
      .code(200)
      .unstate('jwt', {
        path: '/',
        isSecure: false,
        isSameSite: 'Lax',
      });
  } catch (err) {
    console.error('Error:', err);
    return h
      .response({
        status: 'error',
        message: err.message || 'Terjadi kesalahan pada server',
      })
      .code(err.statusCode || 500);

  }
};

export const currentUser = async (request, h) => {
  try {

    if (!request.auth.credentials?.id) {
      return h
        .response({
          status: 'error',
          message: 'Kredensial tidak valid atau belum login',
        })
        .code(401);
    }

    const user = await User.findById(request.auth.credentials.id).select('-password -__v');

    return h
      .response({
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          hasProfilePicture: user.profilePictureData ? true : false,
          age: user.age || null,
          height: user.height || null,
          weight: user.weight || null,
        },
      })
      .code(200);
  } catch (err) {
    console.error('Error:', err);
    return h
      .response({
        status: 'error',
        message: err.message || 'Terjadi kesalahan pada server',
      })
      .code(err.statusCode || 500);
  }
};

export const updateProfile = async (request, h) => {
  try {
    if (!request.auth.credentials?.id) {
      return h
        .response({
          status: 'error',
          message: 'Kredensial tidak valid atau belum login',
        })
        .code(401);
    }

    const userId = request.auth.credentials.id;
    const { age, height, weight, profilePicture } = request.payload;

    const user = await User.findById(userId);

    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age);
    if (height !== undefined) updateData.height = parseFloat(height);
    if (weight !== undefined) updateData.weight = parseFloat(weight);

    if (profilePicture && profilePicture.hapi) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(profilePicture.hapi.headers['content-type'])) {
        return h
          .response({
            status: 'error',
            message: 'File harus berupa gambar (JPEG atau PNG)',
          })
          .code(400);
      }

      const maxFileSize = 5 * 1024 * 1024;
      const chunks = [];
      for await (const chunk of profilePicture) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      if (buffer.length > maxFileSize) {
        return h
          .response({
            status: 'error',
            message: 'Ukuran file tidak boleh melebihi 5MB',
          })
          .code(413);
      }

      updateData.profilePictureData = buffer;
      updateData.profilePictureMimeType = profilePicture.hapi.headers['content-type'];
    }

    await User.findByIdAndUpdate(userId, { $set: updateData });

    return h
      .response({
        status: 'success',
        message: 'Profil berhasil diperbarui',
      })
      .code(200);
  } catch (err) {
    console.error('Error:', err);
    return h
      .response({
        status: 'error',
        message: err.message || 'Terjadi kesalahan pada server',
      })
      .code(err.statusCode || 500);
  }
};

export const getProfilePicture = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const user = await User.findById(userId).select('profilePictureData profilePictureMimeType');

    if (!user?.profilePictureData) {
      return h
        .response({
          status: 'error',
          message: 'Gambar profil tidak ditemukan',
        })
        .code(404);
    }

    return h.response(user.profilePictureData).type(user.profilePictureMimeType).header('Content-Length', user.profilePictureData.length);
  } catch (err) {
    console.error('Error:', err);
    return h
      .response({
        status: 'error',
        message: err.message || 'Terjadi kesalahan pada server',
      })
      .code(err.statusCode || 500);
  }
};
