// filepath: d:\Projects\Capstone Project\Nutrify-Backend-Project\src\controllers\userControllers.js
import User from '../models/User.js';

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
          role: user.role,
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
