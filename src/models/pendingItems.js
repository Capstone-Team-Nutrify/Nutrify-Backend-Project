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

const PendingItemSchema = new Schema(
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
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewNotes: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

PendingItemSchema.index({ name: 'text', category: 'text', status: 1 });

const pendingItem = mongoose.model('PendingItem', PendingItemSchema);

export default pendingItem;
