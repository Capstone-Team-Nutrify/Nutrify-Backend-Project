import PendingFoodItem from "../models/pendingItem.js";
import FoodItem from "../models/items.js";
import User from "../models/user.js";
import Boom from "@hapi/boom";
import mongoose from "mongoose";

export const getPendingFoodItems = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== "admin" && userRole !== "moderator") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin atau moderator yang dapat mengakses sumber daya ini."
      );
    }

    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pendingItemsQuery = PendingFoodItem.find({ status: "pending" })
      .populate("submittedBy", "name email")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalPendingItemsQuery = PendingFoodItem.countDocuments({
      status: "pending",
    });

    const [pendingItems, totalItems] = await Promise.all([
      pendingItemsQuery.exec(),
      totalPendingItemsQuery.exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedPendingItems = pendingItems.map((item) => ({
      pendingId: item._id.toString(),
      nama: item.nama,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      foto_url: item.foto_url,
      bahan: item.bahan,
      nutrisi_per_100g: item.nutrisi_per_100g,
      submittedBy: item.submittedBy
        ? {
            userId: item.submittedBy._id.toString(),
            name: item.submittedBy.name,
            email: item.submittedBy.email,
          }
        : null,
      submittedAt: item.createdAt ? item.createdAt.toISOString() : null,
    }));

    return h
      .response({
        status: "success",
        message: "Daftar makanan pending berhasil diambil.",
        data: formattedPendingItems,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          limit: limit,
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error("Error getting pending food items:", err.message, err.stack);
    throw Boom.internal(
      "Terjadi kesalahan pada server saat mengambil data pending."
    );
  }
};

export const approvePendingFoodItem = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== "admin" && userRole !== "moderator") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin atau moderator yang dapat melakukan aksi ini."
      );
    }

    const { pendingId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(pendingId)) {
      throw Boom.badRequest("Format ID pending tidak valid.");
    }

    const pendingItem = await PendingFoodItem.findById(pendingId);
    if (!pendingItem) {
      throw Boom.notFound("Item makanan pending tidak ditemukan.");
    }
    if (pendingItem.status !== "pending") {
      throw Boom.badRequest(
        `Item ini sudah di-${pendingItem.status}, tidak bisa disetujui lagi.`
      );
    }

    const foodData = {
      nama: pendingItem.nama,
      kategori: pendingItem.kategori,
      deskripsi: pendingItem.deskripsi,
      foto_url: pendingItem.foto_url,
      bahan: pendingItem.bahan,
      nutrisi_per_100g: pendingItem.nutrisi_per_100g,
      asal: pendingItem.asal,
      disease_rate: pendingItem.disease_rate,
    };

    const existingFoodItem = await FoodItem.findOne({ nama: foodData.nama });
    if (existingFoodItem) {
      pendingItem.status = "rejected";
      await pendingItem.save();
      throw Boom.conflict(
        `Makanan dengan nama '${foodData.nama}' sudah ada di daftar utama. Pengajuan ini ditolak.`
      );
    }

    const newFoodItem = new FoodItem(foodData);
    await newFoodItem.save();

    pendingItem.status = "approved";
    await pendingItem.save();

    return h
      .response({
        status: "success",
        message: `Makanan '${newFoodItem.nama}' berhasil disetujui dan ditambahkan.`,
        data: {
          foodId: newFoodItem._id.toString(),
          nama: newFoodItem.nama,
          status: "approved",
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error("Error approving food item:", err.message, err.stack);
    throw Boom.internal(
      "Terjadi kesalahan pada server saat menyetujui makanan."
    );
  }
};

export const rejectPendingFoodItem = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== "admin" && userRole !== "moderator") {
      throw Boom.forbidden(
        "Akses ditolak. Hanya admin atau moderator yang dapat melakukan aksi ini."
      );
    }

    const { pendingId } = request.params;
    const { rejectionReason } = request.payload || {};

    if (!mongoose.Types.ObjectId.isValid(pendingId)) {
      throw Boom.badRequest("Format ID pending tidak valid.");
    }

    const pendingItem = await PendingFoodItem.findById(pendingId);
    if (!pendingItem) {
      throw Boom.notFound("Item makanan pending tidak ditemukan.");
    }
    if (pendingItem.status !== "pending") {
      throw Boom.badRequest(
        `Item ini sudah di-${pendingItem.status}, tidak bisa ditolak lagi.`
      );
    }

    pendingItem.status = "rejected";
    pendingItem.reviewNotes = rejectionReason || "Tidak ada alasan spesifik.";
    await pendingItem.save();

    return h
      .response({
        status: "success",
        message: `Pengajuan makanan '${pendingItem.nama}' berhasil ditolak.`,
        data: {
          pendingId: pendingItem._id.toString(),
          nama: pendingItem.nama,
          status: "rejected",
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error("Error rejecting food item:", err.message, err.stack);
    throw Boom.internal("Terjadi kesalahan pada server saat menolak makanan.");
  }
};
