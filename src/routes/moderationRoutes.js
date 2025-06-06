/* eslint-disable camelcase */
import Joi from 'joi';
import { getPendingItems, approvePendingItem, rejectPendingItem, getPendingItemById } from '../controllers/moderationController.js';

const BahanItemSchemaJoi = Joi.object({
  ingredientName: Joi.string().optional(),
  ingredientDose: Joi.string().optional(),
  ingredientAlias: Joi.string().allow('', null).optional(),
}).unknown(true);

const VitaminSchemaJoi = Joi.object({
  vitamin_A: Joi.number().optional().allow(null),
  vitamin_B1: Joi.number().optional().allow(null),
  vitamin_B2: Joi.number().optional().allow(null),
  vitamin_B3: Joi.number().optional().allow(null),
  vitamin_B5: Joi.number().optional().allow(null),
  vitamin_B6: Joi.number().optional().allow(null),
  vitamin_B9: Joi.number().optional().allow(null),
  vitamin_B12: Joi.number().optional().allow(null),
  vitamin_C: Joi.number().optional().allow(null),
  vitamin_D: Joi.number().optional().allow(null),
  vitamin_E: Joi.number().optional().allow(null),
  vitamin_K: Joi.number().optional().allow(null)
}).unknown(true).optional().allow(null);

const MineralSchemaJoi = Joi.object({
  calcium: Joi.number().optional().allow(null),
  iron: Joi.number().optional().allow(null),
  magnesium: Joi.number().optional().allow(null),
  phosphorus: Joi.number().optional().allow(null),
  potassium: Joi.number().optional().allow(null),
  zinc: Joi.number().optional().allow(null)
}).unknown(true).optional().allow(null);

const NutrisiSchemaJoi = Joi.object({
  calories: Joi.number().optional().allow(null),
  fat: Joi.number().optional().allow(null),
  carbohydrate: Joi.number().optional().allow(null),
  sugar: Joi.number().optional().allow(null),
  protein: Joi.number().optional().allow(null),
  fiber: Joi.number().optional().allow(null),
  cholesterol: Joi.number().optional().allow(null),
  sodium: Joi.number().optional().allow(null),
  water: Joi.number().optional().allow(null),
  vitamins: VitaminSchemaJoi,
  minerals: MineralSchemaJoi
}).unknown(true).optional().allow(null);

const DiseaseRateSchemaJoi = Joi.object({
    disease: Joi.string().optional(),
    status: Joi.string().optional(),
    level: Joi.string().optional(),
}).unknown(true);

// Skema Joi untuk DAFTAR item pending
const PendingItemSchemaJoi = Joi.object({
  pendingId: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  image: Joi.string().uri().allow('', null).optional(),
  origin: Joi.string().allow('', null).optional(),
  submittedBy: Joi.string().hex().length(24).allow(null).optional().description('ID Pengguna yang mengajukan'), 
  submittedAt: Joi.string().isoDate().allow(null).required(),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
}).unknown(true);

// Skema Joi untuk DETAIL item pending
const PendingItemDetailSchemaJoi = Joi.object({
  pendingId: Joi.string().required(),
  name: Joi.string().required(),
  nation: Joi.string().allow('', null).optional(),
  category: Joi.string().required(),
  description: Joi.string().allow('', null).optional(),
  image: Joi.string().uri().allow('', null).optional(),
  origin: Joi.string().allow('', null).optional(),
  ingredients: Joi.array().items(BahanItemSchemaJoi).optional(), 
  nutrition_total: NutrisiSchemaJoi.optional(), 
  disease_rate: Joi.array().items(DiseaseRateSchemaJoi).optional().allow(null), 
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  submittedBy: Joi.object({ 
    userId: Joi.string().hex().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }).allow(null).optional(),
  submittedAt: Joi.string().isoDate().allow(null).optional(),
  reviewNotes: Joi.string().allow('', null).optional(),
  reviewedBy: Joi.object({
      userId: Joi.string().hex().length(24).required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
  }).allow(null).optional(),
  reviewedAt: Joi.string().isoDate().allow(null).optional(),
  pendingItemUpdatedAt: Joi.string().isoDate().allow(null).optional(),
}).unknown(true);


export default [
  {
    method: 'GET',
    path: '/api/pending-items',
    options: {
      auth: { strategy: 'jwt', mode: 'required' },
      description: 'Dapatkan daftar makanan yang menunggu persetujuan (Admin/Moderator only)',
      tags: ['api', 'moderation'],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(50).default(10),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: Joi.array().items(PendingItemSchemaJoi).required(), 
            pagination: Joi.object({
              currentPage: Joi.number().integer().required(),
              totalPages: Joi.number().integer().required(),
              totalItems: Joi.number().integer().required(),
              limit: Joi.number().integer().required(),
            }).required(),
          }),
        },
      },
      handler: getPendingItems,
    },
  },
  {
    method: 'GET',
    path: '/api/pending-items/{pendingId}',
    options: {
      auth: { strategy: 'jwt', mode: 'required' },
      description: 'Dapatkan detail item makanan pending berdasarkan ID (Admin/Moderator only)',
      tags: ['api', 'moderation'],
      validate: {
        params: Joi.object({
          pendingId: Joi.string().required().description('ID dari item pending'),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: PendingItemDetailSchemaJoi.required(),
          }),
        },
      },
      handler: getPendingItemById,
    },
  },
  {
    method: 'PATCH',
    path: '/api/pending-items/{pendingId}/approve',
    options: {
      auth: { strategy: 'jwt', mode: 'required' },
      description: 'Setujui pengajuan makanan (Admin/Moderator only)',
      tags: ['api', 'moderation'],
      validate: {
        params: Joi.object({
          pendingId: Joi.string().required(),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: Joi.object({
              itemId: Joi.string().required(),
              name: Joi.string().required(),
              status: Joi.string().valid('approved').required(),
            }).required(),
          }),
        },
      },
      handler: approvePendingItem,
    },
  },
  {
    method: 'PATCH',
    path: '/api/pending-items/{pendingId}/reject',
    options: {
      auth: { strategy: 'jwt', mode: 'required' },
      description: 'Tolak pengajuan makanan (Admin/Moderator only)',
      tags: ['api', 'moderation'],
      validate: {
        params: Joi.object({
          pendingId: Joi.string().required(),
        }),
        payload: Joi.object({
          rejectionReason: Joi.string().optional().allow('', null),
        }).optional(),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: Joi.object({
              pendingId: Joi.string().required(),
              name: Joi.string().required(),
              status: Joi.string().valid('rejected').required(),
            }).required(),
          }),
        },
      },
      handler: rejectPendingItem,
    },
  },
];
