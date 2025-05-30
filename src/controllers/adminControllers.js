import User from '../models/User.js';
import Boom from '@hapi/boom';

export const getAllUsers = async (request, h) => {
  try {
    if (request.auth.credentials.role !== 'admin') {
      throw Boom.forbidden('Akses ditolak. Hanya admin yang dapat mengakses sumber daya ini.');
    }

    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const usersQuery = User.find().select('name email role isVerified createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalUsersQuery = User.countDocuments();

    const [users, totalItems] = await Promise.all([usersQuery.exec(), totalUsersQuery.exec()]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedUsers = users.map((user) => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    }));

    return h
      .response({
        status: 'success',
        data: {
          users: formattedUsers,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: totalItems,
            limit: limit,
          },
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error getting all users:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil daftar pengguna.');
  }
};

export const promoteUserToAdmin = async (request, h) => {
  try {
    if (request.auth.credentials.role !== 'admin') {
      throw Boom.forbidden('Akses ditolak. Hanya admin yang dapat melakukan aksi ini.');
    }

    const { userIdToPromote } = request.params;

    const userToPromote = await User.findById(userIdToPromote);
    if (!userToPromote) {
      throw Boom.notFound('Pengguna yang akan dipromosikan tidak ditemukan.');
    }

    if (userToPromote.role === 'admin') {
      return h
        .response({
          status: 'success',
          message: 'Pengguna ini sudah menjadi admin.',
        })
        .code(200);
    }

    userToPromote.role = 'admin';
    await userToPromote.save();

    return h
      .response({
        status: 'success',
        message: `Pengguna ${userToPromote.name} berhasil dipromosikan menjadi admin.`,
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error promoting user:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat mempromosikan pengguna.');
  }
};

export const deleteUserByAdmin = async (request, h) => {
  try {
    if (request.auth.credentials.role !== 'admin') {
      throw Boom.forbidden('Akses ditolak. Hanya admin yang dapat melakukan aksi ini.');
    }

    const adminMakingRequest = request.auth.credentials.id;
    const { userIdToDelete } = request.params;

    if (adminMakingRequest === userIdToDelete) {
      throw Boom.badRequest('Admin tidak dapat menghapus akunnya sendiri melalui endpoint ini.');
    }

    const userToDelete = await User.findById(userIdToDelete);
    if (!userToDelete) {
      throw Boom.notFound('Pengguna yang akan dihapus tidak ditemukan.');
    }

    if (userToDelete.role === 'admin') {
      throw Boom.forbidden('Admin tidak diizinkan menghapus akun admin lain.');
    }

    await User.findByIdAndDelete(userIdToDelete);

    return h
      .response({
        status: 'success',
        message: `Pengguna ${userToDelete.name} berhasil dihapus.`,
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error deleting user by admin:', err.message);
    throw Boom.internal('Terjadi kesalahan pada server saat menghapus pengguna.');
  }
};
