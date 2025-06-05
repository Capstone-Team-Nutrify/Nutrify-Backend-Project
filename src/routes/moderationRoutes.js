/* eslint-disable camelcase */
import Joi from 'joi';
import { getPendingItems, approvePendingItem, rejectPendingItem } from '../controllers/moderationController.js';

const BahanItemSchemaJoi = Joi.object({
  name: Joi.string(),
  jumlah: Joi.string(),
  alias: Joi.string().allow('', null).optional(),
}).unknown(true);

const NutrisiSchemaJoi = Joi.object().unknown(true);

const PendingItemSchemaJoi = Joi.object({
  pendingId: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().allow('', null),
  img: Joi.string().uri().allow('', null),
  bahan: Joi.array().items(BahanItemSchemaJoi),
  nutrisi_total: NutrisiSchemaJoi,
  submittedBy: Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }).allow(null),
  submittedAt: Joi.string().isoDate().allow(null).required(),
});

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
