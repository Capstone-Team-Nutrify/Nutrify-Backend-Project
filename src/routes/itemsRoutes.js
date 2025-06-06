/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import Joi from 'joi';
import { getAllItems, getItemById, createItem } from '../controllers/itemsController.js';

const BahanItemSchemaJoi = Joi.object({
  ingredientName: Joi.string(),
  ingredientDose: Joi.string(),
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
}).unknown(true)
  .optional()
  .allow(null);

const ItemDetailSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  nation: Joi.string().allow(null, ''),
  category: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  image: Joi.string().uri().allow(null, ''),
  origin: Joi.string().allow(null, ''),
  ingredients: Joi.array().items(BahanItemSchemaJoi),
  nutrition_total: NutrisiSchemaJoi, 
  disease_rate: Joi.array().items(
    Joi.object({
      disease: Joi.string().optional(),
      status: Joi.string().optional(),
      level: Joi.string().optional(),
    }).unknown(true)
  ).optional().allow(null),
  status: Joi.string().valid('approved').optional(),
  submittedBy: Joi.string().allow(null, '').optional(),
  submittedAt: Joi.string().isoDate().allow(null).optional(),
  reviewedBy: Joi.string().allow(null, '').optional(),
  reviewedAt: Joi.string().isoDate().allow(null).optional(),
  isPublic: Joi.boolean().optional(),
}).unknown(true);

const ItemListSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  origin: Joi.string().allow(null, ''),
  category: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  image: Joi.string().uri().required().allow(null, ''),
  origin: Joi.string().allow(null, ''),
  submittedBy: Joi.string().allow(null, '').optional(),
  submittedAt: Joi.string().isoDate().allow(null).optional(),
}).unknown(true);

const IngredientInputSchema = Joi.object({
  ingredientAlias: Joi.string().allow('', null).optional(),
  ingredientName: Joi.string().required(),
  ingredientDose: Joi.string().required(),
});



const CreateItemPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  nation: Joi.string().allow('', null).optional(),
  description: Joi.string().min(10).required(),
  image: Joi.string().uri().required(),
  category: Joi.string().required(),
  // nutrisi_total: NutrisiSchemaJoiDb.required(),
  origin: Joi.string().allow('', null).optional(),
  ingredients: Joi.array().items(IngredientInputSchema).min(1).required(),
});

export default [
  {
    method: 'GET',
    path: '/api/items',
    options: {
      auth: false,
      description: 'Dapatkan semua daftar makanan dan minuman (approved/public)',
      tags: ['api', 'items'],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(20),
          search: Joi.string().optional().allow(''),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: Joi.array().items(ItemListSchema).required(),
            pagination: Joi.object({
              currentPage: Joi.number().integer().required(),
              totalPages: Joi.number().integer().required(),
              totalItems: Joi.number().integer().required(),
              limit: Joi.number().integer().required(),
            }).required(),
          }),
        },
      },
      handler: getAllItems,
    },
  },
{
    method: 'GET',
    path: '/api/items/{id}',
    options: {
      auth: false,
      description: 'Dapatkan detail makanan atau minuman berdasarkan ID (approved)',
      tags: ['api', 'items'],
      validate: {
        params: Joi.object({
          id: Joi.string().required(), 
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: ItemDetailSchema.required(), 
          }),
        },
      },
      handler: getItemById, 
    },
  },
  {
    method: 'POST',
    path: '/api/items',
    options: {
      auth: { strategy: 'jwt', mode: 'required' },
      description: 'Tambahkan data makanan/minuman baru...',
      tags: ['api', 'items'],
      validate: {
        payload: CreateItemPayloadSchema,
      },
      response: {
        status: {
          201: Joi.object({
            status: Joi.string().valid('success').required(),
            message: Joi.string().required(),
            data: Joi.object({
              itemId: Joi.string().required(),
              status: Joi.string().valid('pending', 'approved').required(),
              submittedAt: Joi.string().isoDate().required(),
            }).required(),
          }),
        },
      },
      handler: createItem,
    },
  },
];
