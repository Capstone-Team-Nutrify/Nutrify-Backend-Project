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

const NutrisiSchema = new Schema(
  {
    kalori: Number,
    lemak: Number,
    karbohidrat: Number,
    protein: Number,
    gula: Number,
    serat: Number,
    kolesterol: Number,
    natrium: Number,
    air: Number,
    vitamin_C: Number,
  },
  { _id: false, strict: false }
);

const PendingFoodItemSchema = new Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    asal: {
      type: String,
      trim: true,
    },
    kategori: {
      type: String,
      required: true,
    },
    deskripsi: {
      type: String,
      trim: true,
    },
    foto_url: {
      type: String,
      trim: true,
    },
    bahan: [BahanSchema],
    nutrisi_per_100g: NutrisiSchema,
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

PendingFoodItemSchema.index({ nama: "text", kategori: "text", status: 1 });

const PendingFoodItem = mongoose.model(
  "PendingFoodItem",
  PendingFoodItemSchema
);

export default PendingFoodItem;
