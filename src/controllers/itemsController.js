import Item from '../models/items.js';
import pendingItem from '../models/pendingItems.js';
import Boom from '@hapi/boom';
import mongoose from 'mongoose';
import { getPredictionFromML } from '../services/mlService.js';

export const getAllItems = async (request, h) => {
  try {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const searchQuery = request.query.search;

    let query = {};
    if (searchQuery) {
      query = { name: { $regex: searchQuery, $options: 'i' } };
    }

    const ItemsQuery = Item.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const totalItemsQuery = Item.countDocuments(query);

    const [Items, totalItems] = await Promise.all([
      ItemsQuery.exec(),
      totalItemsQuery.exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const formattedItems = Items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      nation: item.nation,
      category: item.category,
      description: item.description,
      image: item.image,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    }));

    return h
      .response({
        status: 'success',
        message: 'Daftar makanan dan minuman berhasil diambil.',
        data: formattedItems,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          limit: limit,
        },
      })
      .code(200);
  } catch (err) {
    console.error('Error getting all items:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil data.');
  }
};

export const getItemById = async (request, h) => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Boom.badRequest('Format ID tidak valid.');
    }

    const item = await Item.findById(id);

    if (!item) {
      throw Boom.notFound('Makanan atau minuman tidak ditemukan.');
    }

    const formattedItem = {
      id: item._id.toString(),
      name: item.name,
      nation: item.nation,
      category: item.category,
      description: item.description,
      image: item.image,
      ingredients: item.ingredients,
      nutritionTotal: item.nutritionTotal,
      diseaseRate: item.diseaseRate,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };

    return h
      .response({
        status: 'success',
        message: 'Detail makanan atau minuman berhasil diambil.',
        data: formattedItem,
      })
      .code(200);
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error getting item by ID:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil data.');
  }
};

export const createItem = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const userRole = request.auth.credentials.role;
    const payload = request.payload;
    const prediction = await getPredictionFromML(
      payload.ingredients.map((ing) => ({
        ingredient: ing.ingredientName,
        dose: ing.ingredientDose,
      }))
    );

    const nutritionTotal = prediction?.predict?.total_nutrition || {};
    const diseaseRate = prediction?.predict?.disease_rate || [];

    const itemData = {
      name: payload.name,
      nation: payload.nation,
      category: payload.category,
      description: payload.description,
      image: payload.image,
      origin: payload.origin,
      ingredients: payload.ingredients.map((ing) => ({
        ingredientName: ing.ingredientName,
        ingredientDose: ing.ingredientDose,
        ingredientAlias: ing.ingredientAlias,
      })),
      nutritionTotal: nutritionTotal,
      diseaseRate: diseaseRate,
    };

    if (userRole === 'admin' || userRole === 'moderator') {
      const newItem = new Item({
        ...itemData,
        status: 'approved', // Set status langsung di sini
      });

      await newItem.save();

      console.log('Ini Hasil predict langsung: ', prediction);
      console.log('Hasil Predict: ', { predict: itemData });
      console.log('isi nutrition total: ', nutritionTotal);
      console.log('isi disease rate: ', diseaseRate);

      return h
        .response({
          status: 'success',
          message: 'item added successfully',
          data: {
            itemId: newItem._id.toString(),
            status: 'approved',
            submittedAt: newItem.createdAt.toISOString(),
          },
        })
        .code(201);
    } else {
      const pewPendingItem = new pendingItem({
        ...itemData,
        submittedBy: userId,
        status: 'pending',
      });
      await pewPendingItem.save();

      return h
        .response({
          status: 'success',
          message: 'item submitted for approval',
          data: {
            itemId: pewPendingItem._id.toString(),
            status: 'pending',
            submittedAt: pewPendingItem.createdAt.toISOString(),
          },
        })
        .code(201);
    }
  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    if (err.code === 11000) {
      throw Boom.conflict(
        'Data makanan dengan name ini mungkin sudah ada atau sedang diajukan.'
      );
    }
    console.error('Error creating item:', err.message, err.stack);
    throw Boom.internal(
      'Terjadi kesalahan pada server saat menambahkan data makanan.'
    );
  }
};
