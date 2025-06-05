import Joi from 'joi';
import {
  getAllItems,
  getItemById,
  createItem,
} from '../controllers/itemsController.js';

const BahanItemSchemaJoi = Joi.object({
  ingredientName: Joi.string(),
  ingredientDose: Joi.string(),
  ingredientAlias: Joi.string().allow('', null).optional(),
}).unknown(true);

const NutrisiSchemaJoi = Joi.object().unknown(true);

const ItemDetailSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  nation: Joi.string().allow(null, ''),
  category: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  image: Joi.string().uri().allow(null, ''),
  ingredients: Joi.array().items(BahanItemSchemaJoi),
  nutritionTotal: NutrisiSchemaJoi,
  diseaseRate: Joi.array().items(
    Joi.object({
      disease: Joi.string(),
      status: Joi.string(),
      level: Joi.string(),
    }).unknown(true)
  ),
  createdAt: Joi.string().isoDate().allow(null).required(),
  updatedAt: Joi.string().isoDate().allow(null).required(),
}).unknown(true);

const ItemListSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  origin: Joi.string().allow(null, ''),
  category: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  image: Joi.string().uri().required().allow(null, ''),
  createdAt: Joi.string().isoDate().allow(null).required(),
  updatedAt: Joi.string().isoDate().allow(null).required(),
}).unknown(true);

const IngredientInputSchema = Joi.object({
  ingredientAlias: Joi.string().allow('', null).optional(),
  ingredientName: Joi.string().required(),
  ingredientDose: Joi.string().required(),
});

const VitaminSchemaJoi = Joi.object({
  vitaminA: Joi.number().min(0).optional(), // Angka, minimal 0, opsional
  vitaminB1: Joi.number().min(0).optional(),
  vitaminB2: Joi.number().min(0).optional(),
  vitaminB3: Joi.number().min(0).optional(),
  vitaminB5: Joi.number().min(0).optional(),
  vitaminB6: Joi.number().min(0).optional(),
  vitaminB11: Joi.number().min(0).optional(),
  vitaminB12: Joi.number().min(0).optional(),
  vitaminC: Joi.number().min(0).optional(),
  vitaminD: Joi.number().min(0).optional(),
  vitaminE: Joi.number().min(0).optional(),
  vitaminK: Joi.number().min(0).optional(),
}).unknown(false);

// Joi Schema untuk MineralSchema
const MineralSchemaJoi = Joi.object({
  calsium: Joi.number().min(0).optional(),
  iron: Joi.number().min(0).optional(),
  magnesium: Joi.number().min(0).optional(),
  phosphorus: Joi.number().min(0).optional(),
  potassium: Joi.number().min(0).optional(),
  zinc: Joi.number().min(0).optional(),
}).unknown(false);

// Joi Schema untuk NutrisiSchema (menggabungkan Vitamin dan Mineral)
const NutrisiSchemaJoiDb = Joi.object({
  calories: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
  carbohydrate: Joi.number().min(0).optional(),
  sugar: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  fiber: Joi.number().min(0).optional(),
  cholesterol: Joi.number().min(0).optional(),
  sodium: Joi.number().min(0).optional(),
  water: Joi.number().min(0).optional(),
  vitamins: VitaminSchemaJoi.optional(),
  minerals: MineralSchemaJoi.optional(),
}).unknown(true);

const CreateItemPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  nation: Joi.string().min(1).required(),
  description: Joi.string().min(10).required(),
  image: Joi.string().uri().required(),
  category: Joi.string().required(),
  origin: Joi.string().min(1).required(),
  nutritionTotal: NutrisiSchemaJoiDb.optional(),
  diseaseRate: Joi.array()
    .items(
      Joi.object({
        disease: Joi.string(),
        status: Joi.string(),
        level: Joi.string(),
      }).unknown(true)
    )
    .optional(),
  ingredients: Joi.array().items(IngredientInputSchema).min(1).required(),
});

export default [
  {
    method: 'GET',
    path: '/api/items',
    options: {
      auth: false,
      description: 'Dapatkan semua daftar makanan dan minuman (approved)',
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
      description:
        'Dapatkan detail makanan atau minuman berdasarkan ID (approved)',
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
