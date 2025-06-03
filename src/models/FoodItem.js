// import { boolean, number } from "joi";
import mongoose from "mongoose";
const { Schema } = mongoose;

const BahanSchema = new Schema(
  {
    ingredientAlias: String,
    ingredientName: String,
    ingredientDose: String,
  },
  { _id: false }
);

const VitaminSchema = new Schema(
  {
    vitamin_A: Number,
    vitamin_B1: Number,
    vitamin_B2: Number,
    vitamin_B3: Number,
    vitamin_B5: Number,
    vitamin_B6: Number,
    vitamin_B9: Number,
    vitamin_B12: Number,
    vitamin_C: Number,
    vitamin_D: Number,
    vitamin_E: Number,
    vitamin_K: Number,
  },
  { _id: false }
);

const MineralSchema = new Schema(
  {
    calsium: Number,
    iron: Number,
    magnesium: Number,
    phosphorus: Number,
    potassium: Number,
    zinc: Number,
  },
  { _id: false }
);

const NutrisiSchema = new Schema(
  {
    calories: Number,
    fat: Number,
    carbohydrate: Number,
    sugar: Number,
    protein: Number,
    fiber: Number,
    cholesterol: Number,
    sodium: Number,
    water: Number,
    vitamins: VitaminSchema,
    minerals: MineralSchema,
  },
  { _id: false, strict: false }
);

const DiseaseRateSchema = new Schema(
  {
    disease: String,
    warning: String,
    note: String,
  },
  { _id: false }
);

const FoodItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nation: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    origin: {
      type: String,
      trim: true,
    },
    ingredients: [BahanSchema],
    nutrisi_total: NutrisiSchema,
    disease_rate: [DiseaseRateSchema],
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "items",
  }
);

FoodItemSchema.index({ name: "text", origin: "text", category: "text" });

const FoodItem = mongoose.model("FoodItem", FoodItemSchema);

export default FoodItem;
