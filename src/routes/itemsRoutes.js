import Joi from "joi";
import {
  getAllFoodItems,
  getFoodItemById,
  createFoodItem,
} from "../controllers/itemsController.js";

const BahanItemSchemaJoi = Joi.object({
  nama: Joi.string(),
  jumlah: Joi.string(),
  alias: Joi.string().allow("", null).optional(),
}).unknown(true);

const NutrisiSchemaJoi = Joi.object().unknown(true);

const FoodItemDetailSchema = Joi.object({
  id: Joi.string().required(),
  nama: Joi.string().required(),
  asal: Joi.string().allow(null, ""),
  kategori: Joi.string().required(),
  deskripsi: Joi.string().allow(null, ""),
  foto_url: Joi.string().uri().allow(null, ""),
  bahan: Joi.array().items(BahanItemSchemaJoi),
  nutrisi_per_100g: NutrisiSchemaJoi,
  disease_rate: Joi.array().items(
    Joi.object({
      penyakit: Joi.string(),
      peringatan: Joi.string(),
      catatan: Joi.string(),
    }).unknown(true)
  ),
  createdAt: Joi.string().isoDate().allow(null).required(),
  updatedAt: Joi.string().isoDate().allow(null).required(),
}).unknown(true);

const FoodItemListSchema = Joi.object({
  id: Joi.string().required(),
  nama: Joi.string().required(),
  asal: Joi.string().allow(null, ""),
  kategori: Joi.string().required(),
  deskripsi: Joi.string().allow(null, ""),
  foto_url: Joi.string().uri().allow(null, ""),
  createdAt: Joi.string().isoDate().allow(null).required(),
  updatedAt: Joi.string().isoDate().allow(null).required(),
}).unknown(true);

const IngredientInputSchema = Joi.object({
  ingredientAlias: Joi.string().allow("", null).optional(),
  ingredientName: Joi.string().required(),
  ingredientDose: Joi.string().required(),
});

const NutritionInputSchema = Joi.object({
  kalori: Joi.number().min(0).required(),
  lemak: Joi.number().min(0).required(),
  karbohidrat: Joi.number().min(0).required(),
  protein: Joi.number().min(0).optional(),
  gula: Joi.number().min(0).optional(),
  serat: Joi.number().min(0).required(),
  kolesterol: Joi.number().min(0).required(),
  natrium: Joi.number().min(0).required(),
  vitamin_C: Joi.number().min(0).optional(),
}).unknown(true);

const CreateFoodItemPayloadSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  imageUrl: Joi.string().uri().required(),
  category: Joi.string().required(),
  nutritionPer100g: NutritionInputSchema.required(),
  ingredients: Joi.array().items(IngredientInputSchema).min(1).required(),
});

export default [
  {
    method: "GET",
    path: "/api/food-items",
    options: {
      auth: false,
      description: "Dapatkan semua daftar makanan dan minuman (approved)",
      tags: ["api", "food-items"],
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(20),
          search: Joi.string().optional().allow(""),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
            data: Joi.array().items(FoodItemListSchema).required(),
            pagination: Joi.object({
              currentPage: Joi.number().integer().required(),
              totalPages: Joi.number().integer().required(),
              totalItems: Joi.number().integer().required(),
              limit: Joi.number().integer().required(),
            }).required(),
          }),
        },
      },
      handler: getAllFoodItems,
    },
  },
  {
    method: "GET",
    path: "/api/food-items/{id}",
    options: {
      auth: false,
      description:
        "Dapatkan detail makanan atau minuman berdasarkan ID (approved)",
      tags: ["api", "food-items"],
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
      response: {
        status: {
          200: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
            data: FoodItemDetailSchema.required(),
          }),
        },
      },
      handler: getFoodItemById,
    },
  },
  {
    method: "POST",
    path: "/api/food-items",
    options: {
      auth: { strategy: "jwt", mode: "required" },
      description: "Tambahkan data makanan/minuman baru...",
      tags: ["api", "food-items"],
      validate: {
        payload: CreateFoodItemPayloadSchema,
      },
      response: {
        status: {
          201: Joi.object({
            status: Joi.string().valid("success").required(),
            message: Joi.string().required(),
            data: Joi.object({
              foodId: Joi.string().required(),
              status: Joi.string().valid("pending", "approved").required(),
              submittedAt: Joi.string().isoDate().required(),
            }).required(),
          }),
        },
      },
      handler: createFoodItem,
    },
  },
];
