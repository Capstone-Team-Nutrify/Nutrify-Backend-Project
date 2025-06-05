// import { boolean, number } from "joi";
import mongoose from 'mongoose';
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
    vitaminA: Number,
    vitaminB1: Number,
    vitaminB2: Number,
    vitaminB3: Number,
    vitaminB5: Number,
    vitaminB6: Number,
    vitaminB11: Number,
    vitaminB12: Number,
    vitaminC: Number,
    vitaminD: Number,
    vitaminE: Number,
    vitaminK: Number,
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
    status: String,
    level: String,
  },
  { _id: false }
);

const ItemSchema = new Schema(
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
    nutritionTotal: NutrisiSchema,
    diseaseRate: [DiseaseRateSchema],
    status: {
      type: String,
      trim: true,
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date, default: Date.now },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'items',
  }
);

ItemSchema.index({ name: 'text', origin: 'text', category: 'text' });

const Item = mongoose.model('Item', ItemSchema);

export default Item;
