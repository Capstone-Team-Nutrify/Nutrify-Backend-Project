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
    vitamin_B11: Number,
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
    ingredients: [BahanSchema],
    nutrisi_total: NutrisiSchema,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewNotes: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

PendingItemSchema.index({ name: "text", category: "text", status: 1 });

const pendingItem = mongoose.model("PendingItem", PendingItemSchema);

export default pendingItem;
