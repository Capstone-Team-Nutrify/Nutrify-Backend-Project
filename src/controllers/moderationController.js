/* eslint-disable indent */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import PendingItem from '../models/pendingItems.js';
import Item from '../models/items.js';
import User from '../models/user.js';
import Boom from '@hapi/boom';
import mongoose from 'mongoose';

export const getPendingItems = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw Boom.forbidden('Akses ditolak. Hanya admin atau moderator yang dapat mengakses sumber daya ini.');
    }

    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pendingItemsQuery = PendingItem.find({ status: 'pending' }).populate('submittedBy', 'name email').sort({ createdAt: 1 }).skip(skip).limit(limit);

    const totalPendingItemsQuery = PendingItem.countDocuments({
      status: 'pending',
    });

    const [pendingItems, totalItems] = await Promise.all([pendingItemsQuery.exec(), totalPendingItemsQuery.exec()]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedPendingItems = pendingItems.map((item) => ({
      pendingId: item._id.toString(),
      name: item.name,
      category: item.category,
      description: item.description,
      img: item.img,
      ingredients: item.ingredients,
      nutrisi_total: item.nutrisi_total,
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
        status: 'success',
        message: 'Daftar makanan pending berhasil diambil.',
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
    console.error('Error getting pending items:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil data pending.');
  }
};

export const approvePendingItem = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw Boom.forbidden('Akses ditolak. Hanya admin atau moderator yang dapat melakukan aksi ini.');
    }

    const { pendingId } = request.params;
    if (!mongoose.Types.ObjectId.isValid(pendingId)) {
      throw Boom.badRequest('Format ID pending tidak valid.');
    }

    const pendingItem = await PendingItem.findById(pendingId);
    if (!pendingItem) {
      throw Boom.notFound('Item makanan pending tidak ditemukan.');
    }
    if (pendingItem.status !== 'pending') {
      throw Boom.badRequest(`Item ini sudah di-${pendingItem.status}, tidak bisa disetujui lagi.`);
    }

    const itemData = {
      name: pendingItem.name,
      category: pendingItem.category,
      description: pendingItem.description,
      img: pendingItem.img,
      ingredients: pendingItem.ingredients,
      nutrisi_total: pendingItem.nutrisi_total,
      asal: pendingItem.asal,
      disease_rate: pendingItem.disease_rate,
    };

    const existingItem = await Item.findOne({ name: itemData.name });
    if (existingItem) {
      pendingItem.status = 'rejected';
      await pendingItem.save();
      throw Boom.conflict(`Makanan dengan name '${itemData.name}' sudah ada di daftar utama. Pengajuan ini ditolak.`);
    }

    const newItem = new Item(itemData);
    await newItem.save();

    pendingItem.status = 'approved';
    await pendingItem.save();

    return h
      .response({
        status: 'success',
        message: `Makanan '${newItem.name}' berhasil disetujui dan ditambahkan.`,
        data: {
          itemId: newItem._id.toString(),
          name: newItem.name,
          status: 'approved',
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error approving item:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat menyetujui makanan.');
  }
};

export const rejectPendingItem = async (request, h) => {
  try {
    const userRole = request.auth.credentials.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw Boom.forbidden('Akses ditolak. Hanya admin atau moderator yang dapat melakukan aksi ini.');
    }

    const { pendingId } = request.params;
    const { rejectionReason } = request.payload || {};

    if (!mongoose.Types.ObjectId.isValid(pendingId)) {
      throw Boom.badRequest('Format ID pending tidak valid.');
    }

    const pendingItem = await PendingItem.findById(pendingId);
    if (!pendingItem) {
      throw Boom.notFound('Item makanan pending tidak ditemukan.');
    }
    if (pendingItem.status !== 'pending') {
      throw Boom.badRequest(`Item ini sudah di-${pendingItem.status}, tidak bisa ditolak lagi.`);
    }

    pendingItem.status = 'rejected';
    pendingItem.reviewNotes = rejectionReason || 'Tidak ada alasan spesifik.';
    await pendingItem.save();

    return h
      .response({
        status: 'success',
        message: `Pengajuan makanan '${pendingItem.name}' berhasil ditolak.`,
        data: {
          pendingId: pendingItem._id.toString(),
          name: pendingItem.name,
          status: 'rejected',
        },
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error rejecting item:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat menolak makanan.');
  }
};
