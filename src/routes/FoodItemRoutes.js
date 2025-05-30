
import Joi from 'joi';
import { getAllFoodItems, getFoodItemById } from '../controllers/foodItemController.js';


const BahanItemSchema = Joi.object({
    nama: Joi.string(),
    jumlah: Joi.string()
}).unknown(true); 

const FoodItemDetailSchema = Joi.object({
    id: Joi.string().required(),
    nama: Joi.string().required(),
    asal: Joi.string().allow(null, ''),
    kategori: Joi.string().valid('Makanan', 'Minuman').required(),
    deskripsi: Joi.string().allow(null, ''),
    foto_url: Joi.string().uri().allow(null, ''),
    bahan: Joi.array().items(BahanItemSchema), 
    nutrisi_per_100g: Joi.object().unknown(true),
    disease_rate: Joi.array().items(Joi.object({
        penyakit: Joi.string(),
        peringatan: Joi.string(),
        catatan: Joi.string()
    }).unknown(true)), 
    createdAt: Joi.string().isoDate().allow(null).required(),
    updatedAt: Joi.string().isoDate().allow(null).required()
}).unknown(true); 


const FoodItemListSchema = Joi.object({
    id: Joi.string().required(),
    nama: Joi.string().required(),
    asal: Joi.string().allow(null, ''),
    kategori: Joi.string().valid('Makanan', 'Minuman').required(),
    deskripsi: Joi.string().allow(null, ''),
    foto_url: Joi.string().uri().allow(null, ''),
    createdAt: Joi.string().isoDate().allow(null).required(),
    updatedAt: Joi.string().isoDate().allow(null).required()
}).unknown(true); 

export default [
    {
        method: 'GET',
        path: '/api/food-items',
        options: {
            auth: false,
            description: 'Dapatkan semua daftar makanan dan minuman',
            tags: ['api', 'food-items'],
            validate: {
                query: Joi.object({
                    page: Joi.number().integer().min(1).default(1).description('Nomor halaman'),
                    limit: Joi.number().integer().min(1).max(100).default(20).description('Jumlah item per halaman'),
                    search: Joi.string().optional().allow('').description('Kata kunci pencarian berdasarkan nama makanan')
                })
            },
            response: {
                status: {
                    200: Joi.object({
                        status: Joi.string().valid('success').required(),
                        message: Joi.string().required(),
                        data: Joi.array().items(FoodItemListSchema).required(),
                        pagination: Joi.object({
                            currentPage: Joi.number().integer().required(),
                            totalPages: Joi.number().integer().required(),
                            totalItems: Joi.number().integer().required(),
                            limit: Joi.number().integer().required()
                        }).required()
                    })
                }
            },
            handler: getAllFoodItems
        }
    },
    {
        method: 'GET',
        path: '/api/food-items/{id}',
        options: {
            auth: false,
            description: 'Dapatkan detail makanan atau minuman berdasarkan ID',
            tags: ['api', 'food-items'],
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('ID makanan atau minuman')
                })
            },
            response: {
                status: {
                    200: Joi.object({
                        status: Joi.string().valid('success').required(),
                        message: Joi.string().required(),
                        data: FoodItemDetailSchema.required()
                    })
                }
            },
            handler: getFoodItemById
        }
    }
];