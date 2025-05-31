import FoodItem from '../models/FoodItem.js';
import PendingFoodItem from '../models/PendingFoodItem.js';
import Boom from '@hapi/boom';
import mongoose from 'mongoose';

export const getAllFoodItems = async (request, h) => {
    try {
        const page = parseInt(request.query.page, 10) || 1;
        const limit = parseInt(request.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const searchQuery = request.query.search;

        let query = {};
        if (searchQuery) {
            query = { nama: { $regex: searchQuery, $options: 'i' } };
        }

        const foodItemsQuery = FoodItem.find(query) 
            .sort({ nama: 1 })
            .skip(skip)
            .limit(limit);

        const totalItemsQuery = FoodItem.countDocuments(query);

        const [foodItems, totalItems] = await Promise.all([
            foodItemsQuery.exec(),
            totalItemsQuery.exec()
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const formattedFoodItems = foodItems.map(item => ({
            id: item._id.toString(),
            nama: item.nama,
            asal: item.asal,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            foto_url: item.foto_url,
            createdAt: item.createdAt ? item.createdAt.toISOString() : null,
            updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null
        }));

        return h.response({
            status: "success",
            message: "Daftar makanan dan minuman berhasil diambil.",
            data: formattedFoodItems,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                limit: limit
            }
        }).code(200);

    } catch (err) {
        console.error("Error getting all food items:", err.message, err.stack);
        throw Boom.internal("Terjadi kesalahan pada server saat mengambil data.");
    }
};

export const getFoodItemById = async (request, h) => {
    try {
        const { id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Boom.badRequest('Format ID tidak valid.');
        }

        const foodItem = await FoodItem.findById(id); 

        if (!foodItem) {
            throw Boom.notFound('Makanan atau minuman tidak ditemukan.');
        }
        
        const formattedFoodItem = {
            id: foodItem._id.toString(),
            nama: foodItem.nama,
            asal: foodItem.asal,
            kategori: foodItem.kategori,
            deskripsi: foodItem.deskripsi,
            foto_url: foodItem.foto_url,
            bahan: foodItem.bahan,
            nutrisi_per_100g: foodItem.nutrisi_per_100g,
            disease_rate: foodItem.disease_rate,
            createdAt: foodItem.createdAt ? foodItem.createdAt.toISOString() : null,
            updatedAt: foodItem.updatedAt ? foodItem.updatedAt.toISOString() : null
        };

        return h.response({
            status: "success",
            message: "Detail makanan atau minuman berhasil diambil.",
            data: formattedFoodItem
        }).code(200);

    } catch (err) {
        if (err.isBoom) {
            throw err;
        }
        console.error("Error getting food item by ID:", err.message, err.stack);
        throw Boom.internal("Terjadi kesalahan pada server saat mengambil data.");
    }
};

export const createFoodItem = async (request, h) => {
    try {
        const userId = request.auth.credentials.id;
        const userRole = request.auth.credentials.role;
        const payload = request.payload;

        const foodData = {
            nama: payload.name,
            kategori: payload.category,
            deskripsi: payload.description,
            foto_url: payload.imageUrl,
            bahan: payload.ingredients.map(ing => ({
                nama: ing.ingredientName,
                jumlah: ing.ingredientDose,
                alias: ing.ingredientAlias
            })),
            nutrisi_per_100g: payload.nutritionPer100g,
        };

        if (userRole === 'admin' || userRole === 'moderator') {
            const newFoodItem = new FoodItem(foodData);
            await newFoodItem.save();

            return h.response({
                status: "success",
                message: "Food added successfully",
                data: {
                    foodId: newFoodItem._id.toString(),
                    status: "approved",
                    submittedAt: newFoodItem.createdAt.toISOString()
                }
            }).code(201);

        } else {
            const newPendingFoodItem = new PendingFoodItem({
                ...foodData,
                submittedBy: userId,
                status: 'pending'
            });
            await newPendingFoodItem.save();

            return h.response({
                status: "success",
                message: "Food submitted for approval",
                data: {
                    foodId: newPendingFoodItem._id.toString(),
                    status: "pending",
                    submittedAt: newPendingFoodItem.createdAt.toISOString()
                }
            }).code(201);
        }

    } catch (err) {
        if (err.isBoom) {
            throw err;
        }
        if (err.code === 11000) {
            throw Boom.conflict('Data makanan dengan nama ini mungkin sudah ada atau sedang diajukan.');
        }
        console.error("Error creating food item:", err.message, err.stack);
        throw Boom.internal("Terjadi kesalahan pada server saat menambahkan data makanan.");
    }
};