import User from "../models/User.js";
import { errorHandler } from "../utils/responseHandler.js";

export const allUsers = async (request, h) => {
  try {
    if (!request.auth || !request.auth.credentials || request.auth.credentials.role !== "admin") {
      return h
        .response({
          status: "fail",
          message: "Anda tidak memiliki akses untuk melihat daftar pengguna",
        })
        .code(403);
    }

    const users = await User.find().select("-password");
    return h.response({
      status: "success",
      data: { users },
      message: "Daftar pengguna berhasil diambil",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorHandler(error, h);
  }
};
