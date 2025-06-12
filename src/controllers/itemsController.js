/* eslint-disable camelcase */
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

    const itemsQuery = Item.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const totalItemsQuery = Item.countDocuments(query);

    const [items, totalItems] = await Promise.all([itemsQuery.exec(), totalItemsQuery.exec()]);

    const totalPages = Math.ceil(totalItems / limit);
    
    const formattedItems = items.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      nation: item.nation,
      origin: item.origin,
      category: item.category,
      image: item.image,
      description: item.description,
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

const formatItemDetails = (item) => ({
  _id: item._id.toString(),
  name: item.name,
  nation: item.nation,
  image: item.image,
  category: item.category,
  description: item.description,
  origin: item.origin,
  ingredients: item.ingredients,
  nutrition_total: item.nutrition_total,
  disease_rate: item.disease_rate,
  status: 'approved', // Item di koleksi ini selalu 'approved'
  submittedBy: item.submittedBy ? (typeof item.submittedBy === 'object' ? item.submittedBy.name : item.submittedBy) : 'N/A',
  submittedAt: item.submittedAt ? item.submittedAt.toISOString() : null,
  reviewedBy: item.reviewedBy ? (typeof item.reviewedBy === 'object' ? item.reviewedBy.name : item.reviewedBy) : 'N/A',
  reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
  isPublic: item.isPublic,
});


export const getItemById = async (request, h) => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Boom.badRequest('Format ID tidak valid.');
    }

    const item = await Item.findById(id)
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name');

    if (!item) {
      throw Boom.notFound('Makanan atau minuman tidak ditemukan.');
    }

    const formattedItem = formatItemDetails(item); 

    return h.response({
      status: 'success',
      message: 'Detail makanan atau minuman berhasil diambil.',
      data: formattedItem,
    }).code(200);

  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error getting item by ID:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil data.');
  }
};

export const getItemByName = async (request, h) => {
  try {
    const name = decodeURIComponent(request.params.name);

    const item = await Item.findOne({ name: { $regex: new RegExp('^' + name + '$', "i") } })
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name');

    if (!item) {
      throw Boom.notFound('Makanan atau minuman tidak ditemukan.');
    }

    const formattedItem = formatItemDetails(item); 

    return h.response({
      status: 'success',
      message: 'Detail makanan atau minuman berhasil diambil.',
      data: formattedItem,
    }).code(200);
  } catch (err) {
    if (err.isBoom) throw err;
    console.error('Error getting item by name:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengambil data.');
  }
};

export const createItem = async (request, h) => {
  try {
    const userId = request.auth.credentials.id;
    const userRole = request.auth.credentials.role;
    const payload = request.payload;

const ingredientsForML = payload.ingredients.map(ing => ({
  name: ing.ingredientName,
  dose: parseFloat(ing.ingredientDose) || 0, 
}));

const prediction = await getPredictionFromML(ingredientsForML); 

const itemData = {
      name: payload.name,
      nation: payload.nation,
      category: payload.category,
      description: payload.description,
      origin: payload.origin,
      image: payload.image,
      ingredients: payload.ingredients.map((ing) => ({
        ingredientName: ing.ingredientName,
        ingredientDose: ing.ingredientDose,
        ingredientAlias: ing.ingredientAlias,
      })),
      nutrition_total: prediction.predict ? prediction.predict.total_nutrition : undefined,
      disease_rate: prediction.predict ? prediction.predict.disease_rate : undefined,
    };


    if (userRole === 'admin' || userRole === 'moderator') {
        const newItem = new Item({
        ...itemData,
        submittedBy: userId,      
        reviewedBy: userId,       
        reviewedAt: new Date(),   
        status: 'approved',       
        isPublic: true,           
        // submittedAt akan otomatis terisi dari default skema atau timestamps
    });
  await newItem.save();

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
      throw Boom.conflict('Data makanan dengan name ini mungkin sudah ada atau sedang diajukan.');
    }
    console.error('Error creating item:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat menambahkan data makanan.');
  }
};

export const updateItem = async (request, h) => {
  try {
    const { id } = request.params;
    const userRole = request.auth.credentials.role;
    const payload = request.payload;

    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw Boom.forbidden('Akses ditolak. Hanya admin atau moderator yang dapat mengedit item.');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Boom.badRequest('Format ID item tidak valid.');
    }
    const itemToUpdate = await Item.findById(id);
    if (!itemToUpdate) {
      throw Boom.notFound('Item yang akan diupdate tidak ditemukan.');
    }
    
    if (payload.name && payload.name !== itemToUpdate.name) {
        const existingItem = await Item.findOne({ name: payload.name, _id: { $ne: id } });
        if (existingItem) {
            throw Boom.conflict(`Item dengan nama '${payload.name}' sudah ada.`);
        }
    }

    const updateData = { ...payload };

    if (payload.ingredients && payload.ingredients.length > 0) {
      console.log('Bahan diupdate, menghitung ulang nutrisi...');
      const ingredientsForML = payload.ingredients.map(ing => ({
        name: ing.ingredientName,
        dose: parseFloat(ing.ingredientDose) || 0,
      }));

      const prediction = await getPredictionFromML(ingredientsForML);
      if (prediction && prediction.predict) {
        updateData.nutrition_total = prediction.predict.total_nutrition;
        updateData.disease_rate = prediction.predict.disease_rate;
        console.log('Kalkulasi nutrisi baru berhasil.');
      } else {
          throw Boom.serverUnavailable('Gagal menghitung ulang data nutrisi dari layanan eksternal.');
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('submittedBy', 'name').populate('reviewedBy', 'name');

    if (!updatedItem) {
        throw Boom.notFound('Gagal mengupdate item, item tidak ditemukan.');
    }

    return h.response({
      status: 'success',
      message: `Item '${updatedItem.name}' berhasil diupdate.`,
      data: formatItemDetails(updatedItem)
    }).code(200);

  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error updating item:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat mengupdate item.');
  }
};

export const deleteItem = async (request, h) => {
  try {
    const { id } = request.params;
    const userRole = request.auth.credentials.role;

    // 1. Verifikasi hak akses
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw Boom.forbidden('Akses ditolak. Hanya admin atau moderator yang dapat menghapus item.');
    }

    // 2. Validasi ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw Boom.badRequest('Format ID item tidak valid.');
    }

    // 3. Cari dan hapus item
    const deletedItem = await Item.findByIdAndDelete(id);

    // 4. Handle jika item tidak ditemukan
    if (!deletedItem) {
      throw Boom.notFound('Item yang akan dihapus tidak ditemukan.');
    }

    // 5. Kirim respons sukses
    return h.response({
      status: 'success',
      message: `Item '${deletedItem.name}' berhasil dihapus secara permanen.`,
    }).code(200);

  } catch (err) {
    if (err.isBoom) {
      throw err;
    }
    console.error('Error deleting item:', err.message, err.stack);
    throw Boom.internal('Terjadi kesalahan pada server saat menghapus item.');
  }
};