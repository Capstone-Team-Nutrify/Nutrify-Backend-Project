import User from "../models/user.js";
import Boom from "@hapi/boom";

export const getAllUsers = async (request, h) => {
  try {
    if (request.auth.credentials.role !== "admin") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin yang dapat mengakses sumber daya ini."
      );
    }

    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const usersQuery = User.find()
      .select("name email role isVerified createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsersQuery = User.countDocuments();

    const [users, totalItems] = await Promise.all([
      usersQuery.exec(),
      totalUsersQuery.exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedUsers = users.map((user) => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    }));

    return h
      .response({
        status: "success",
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
    console.error("Error getting all users:", err.message, err.stack);
    throw Boom.internal(
      "Terjadi kesalahan pada server saat mengambil daftar pengguna."
    );
  }
};

export const changeUserRole = async (request, h) => {
  try {
    if (request.auth.credentials.role !== "admin") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin yang dapat melakukan aksi ini."
      );
    }

    const { userIdToChange } = request.params;
    const { newRole } = request.payload;

    const adminMakingRequest = request.auth.credentials.id;

    const allowedRoles = ["user", "moderator", "admin"];
    if (!allowedRoles.includes(newRole)) {
      throw Boom.badRequest(
        `Role target tidak valid. Pilih dari: ${allowedRoles.join(", ")}`
      );
    }

    const userToChange = await User.findById(userIdToChange);
    if (!userToChange) {
      throw Boom.notFound("Pengguna yang akan diubah rolenya tidak ditemukan.");
    }

    if (userToChange._id.toString() === adminMakingRequest) {
      throw Boom.badRequest(
        "Admin tidak dapat mengubah role dirinya sendiri melalui endpoint ini."
      );
    }

    if (userToChange.role === newRole) {
      return h
        .response({
          status: "info",
          message: `Pengguna sudah memiliki role '${newRole}'. Tidak ada perubahan.`,
        })
        .code(200);
    }

    if (userToChange.role === "admin" && newRole !== "admin") {
      throw Boom.forbidden(
        "Admin tidak dapat menurunkan role admin lain melalui endpoint ini."
      );
    }

    userToChange.role = newRole;
    await userToChange.save();

    return h
      .response({
        status: "success",
        message: `Role pengguna ${userToChange.name} berhasil diubah menjadi ${newRole}.`,
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error("Error changing user role:", err.message, err.stack);
    throw Boom.internal(
      "Terjadi kesalahan pada server saat mengubah role pengguna."
    );
  }
};

export const deleteUserByAdmin = async (request, h) => {
  try {
    if (request.auth.credentials.role !== "admin") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin yang dapat melakukan aksi ini."
      );
    }

    const adminMakingRequest = request.auth.credentials.id;
    const { userIdToDelete } = request.params;

    if (adminMakingRequest === userIdToDelete) {
      throw Boom.badRequest(
        "Admin tidak dapat menghapus akunnya sendiri melalui endpoint ini."
      );
    }

    const userToDelete = await User.findById(userIdToDelete);
    if (!userToDelete) {
      throw Boom.notFound("Pengguna yang akan dihapus tidak ditemukan.");
    }

    if (userToDelete.role === "admin") {
      throw Boom.forbidden("Admin tidak diizinkan menghapus akun admin lain.");
    }

    await User.findByIdAndDelete(userIdToDelete);

    return h
      .response({
        status: "success",
        message: `Pengguna ${userToDelete.name} berhasil dihapus.`,
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error("Error deleting user by admin:", err.message, err.stack);
    throw Boom.internal(
      "Terjadi kesalahan pada server saat menghapus pengguna."
    );
  }
};
