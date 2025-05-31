import Joi from 'joi';
import {
    getPendingFoodItems,
    approvePendingFoodItem,
    rejectPendingFoodItem
} from '../controllers/moderationController.js';

const BahanItemSchemaJoi = Joi.object({
    nama: Joi.string(),
    jumlah: Joi.string(),
    alias: Joi.string().allow('', null).optional()
}).unknown(true);

const NutrisiSchemaJoi = Joi.object().unknown(true);

const PendingFoodItemSchemaJoi = Joi.object({
    pendingId: Joi.string().required(),
    nama: Joi.string().required(),
    kategori: Joi.string().required(),
    deskripsi: Joi.string().allow('', null),
    foto_url: Joi.string().uri().allow('', null),
    bahan: Joi.array().items(BahanItemSchemaJoi),
    nutrisi_per_100g: NutrisiSchemaJoi,
    submittedBy: Joi.object({
        userId: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required()
    }).allow(null), 
    submittedAt: Joi.string().isoDate().allow(null).required() 
});


export default [
    {
        method: 'GET',
        path: '/api/moderation/pending-food-items',
        options: {
            auth: { strategy: 'jwt', mode: 'required' },
            description: 'Dapatkan daftar makanan yang menunggu persetujuan (Admin/Moderator only)',
            tags: ['api', 'moderation'],
            validate: {
                query: Joi.object({
                    page: Joi.number().integer().min(1).default(1),
                    limit: Joi.number().integer().min(1).max(50).default(10)
                })
            },
            response: {
                status: {
                    200: Joi.object({
                        status: Joi.string().valid('success').required(),
                        message: Joi.string().required(),
                        data: Joi.array().items(PendingFoodItemSchemaJoi).required(),
                        pagination: Joi.object({
                            currentPage: Joi.number().integer().required(),
                            totalPages: Joi.number().integer().required(),
                            totalItems: Joi.number().integer().required(),
                            limit: Joi.number().integer().required()
                        }).required()
                    })
                }
            },
            handler: getPendingFoodItems
        }
    },
    {
        method: 'PATCH',
        path: '/api/moderation/pending-food-items/{pendingId}/approve',
        options: {
            auth: { strategy: 'jwt', mode: 'required' },
            description: 'Setujui pengajuan makanan (Admin/Moderator only)',
            tags: ['api', 'moderation'],
            validate: {
                params: Joi.object({
                    pendingId: Joi.string().required()
                })
            },
            response: {
                status: {
                    200: Joi.object({
                        status: Joi.string().valid('success').required(),
                        message: Joi.string().required(),
                        data: Joi.object({
                            foodId: Joi.string().required(),
                            nama: Joi.string().required(),
                            status: Joi.string().valid('approved').required()
                        }).required()
                    })
                }
            },
            handler: approvePendingFoodItem
        }
    },
    {
        method: 'PATCH',
        path: '/api/moderation/pending-food-items/{pendingId}/reject',
        options: {
            auth: { strategy: 'jwt', mode: 'required' },
            description: 'Tolak pengajuan makanan (Admin/Moderator only)',
            tags: ['api', 'moderation'],
            validate: {
                params: Joi.object({
                    pendingId: Joi.string().required()
                }),
                payload: Joi.object({
                    rejectionReason: Joi.string().optional().allow('', null)
                }).optional()
            },
            response: {
                status: {
                    200: Joi.object({
                        status: Joi.string().valid('success').required(),
                        message: Joi.string().required(),
                        data: Joi.object({
                            pendingId: Joi.string().required(),
                            nama: Joi.string().required(),
                            status: Joi.string().valid('rejected').required()
                        }).required()
                    })
                }
            },
            handler: rejectPendingFoodItem
        }
    }
];