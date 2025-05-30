import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Boom from '@hapi/boom';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '6d',
  });
};

const setJwtCookie = (h, token) => {
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

    const userCount = await User.countDocuments();
    let role = 'user';
    if (userCount === 0) {
      role = 'admin';
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Registrasi pengguna pertama (${email}) sebagai admin.`);
      }
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id.toString());

    const response = h
      .response({
        status: 'success',
        message: `Registrasi berhasil${role === 'admin' ? ' sebagai admin.' : '.'}`,
      })
      .code(201);

    setJwtCookie(response, token);
    return response;
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    if (err.code === 11000) {
      throw Boom.conflict('Email yang Anda masukkan sudah terdaftar.');
    }
    console.error('Error registrasi:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat registrasi.');
  }
};

export const loginUser = async (request, h) => {
  try {
    const { email, password } = request.payload;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw Boom.unauthorized('Email atau password salah.');
    }

    const token = generateToken(user._id.toString());
    const response = h
      .response({
        status: 'success',
        message: 'Berhasil Login',
        accessToken: token,
      })
      .code(200);

    setJwtCookie(response, token);
    return response;
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error login:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat login.');
  }
};

export const logoutUser = (request, h) => {
  try {
    const response = h
      .response({
        status: 'success',
        message: 'Logout berhasil',
      })
      .code(200);

    response.unstate('jwt', {
      path: '/',
      isSecure: process.env.NODE_ENV === 'production',
      isSameSite: 'Lax',
    });
    return response;
  } catch (err) {
    console.error('Error logout:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat logout.');
  }
};

export const currentUser = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;

    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      throw Boom.notFound('Pengguna tidak ditemukan.');
    }

    return h
      .response({
        status: 'success',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          hasProfilePicture: !!user.profilePictureData,
          age: user.age || null,
          height: user.height || null,
          weight: user.weight || null,
          createdAt: user.createdAt ? user.createdAt.toISOString() : null,
          updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error mendapatkan current user:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server.');
  }
};

export const updateProfile = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const { age, height, weight, profilePicture } = request.payload;

    const updateData = {};

    if (age !== undefined) updateData.age = age;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;

    if (profilePicture && profilePicture.hapi) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const fileMimeType = profilePicture.hapi.headers['content-type'];

      if (!allowedTypes.includes(fileMimeType)) {
        throw Boom.badData('Tipe file tidak valid. Hanya file JPEG dan PNG yang diizinkan.');
      }

      const maxFileSize = 5 * 1024 * 1024;
      const chunks = [];
      for await (const chunk of profilePicture) {
        chunks.push(chunk);
        if (Buffer.concat(chunks).length > maxFileSize) {
          profilePicture.destroy();
          throw Boom.entityTooLarge('Ukuran file profil tidak boleh melebihi 5MB.');
        }
      }
      const buffer = Buffer.concat(chunks);

      if (buffer.length > maxFileSize) {
        throw Boom.entityTooLarge('Ukuran file profil tidak boleh melebihi 5MB.');
      }

      updateData.profilePictureData = buffer;
      updateData.profilePictureMimeType = fileMimeType;
    } else if (profilePicture === null || profilePicture === '') {
      updateData.profilePictureData = null;
      updateData.profilePictureMimeType = null;
    }

    if (Object.keys(updateData).length === 0 && !(profilePicture === null || profilePicture === '')) {
      const currentUserData = await User.findById(userId).select('name age height weight updatedAt');
      if (!currentUserData) {
        throw Boom.notFound('Pengguna tidak ditemukan.');
      }
      return h
        .response({
          status: 'success',
          message: 'Tidak ada data profil yang diubah.',
          data: {
            userId: currentUserData._id.toString(),
            name: currentUserData.name,
            age: currentUserData.age || null,
            height: currentUserData.height || null,
            weight: currentUserData.weight || null,
            updatedAt: currentUserData.updatedAt.toISOString(),
          },
        })
        .code(200);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('name age height weight updatedAt');
    if (!updatedUser) {
      throw Boom.notFound('Pengguna tidak ditemukan untuk diupdate.');
    }

    return h
      .response({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          userId: updatedUser._id.toString(),
          name: updatedUser.name,
          age: updatedUser.age,
          height: updatedUser.height,
          weight: updatedUser.weight,
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error update profile:', err.message);
    if (err.output && err.output.statusCode === 413) {
      throw Boom.entityTooLarge('Ukuran file profil tidak boleh melebihi 5MB.');
    }
    throw Boom.internal('Terjadi kesalahan pada server saat memperbarui profil.');
  }
};

export const getProfilePicture = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const user = await User.findById(userId).select('profilePictureData profilePictureMimeType');

    if (!user || !user.profilePictureData || !user.profilePictureMimeType) {
      throw Boom.notFound('Gambar profil tidak ditemukan.');
    }

    return h.response(user.profilePictureData).type(user.profilePictureMimeType).header('Content-Length', user.profilePictureData.length.toString());
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error mengambil gambar profil:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server.');
  }
};
