import mongoose from 'mongoose';
const { Schema } = mongoose;

const IngredientsItemSchema = new Schema(
  {
    IngredientEn: {
      type: String,
      required: true,
      trim: true,
    },
    IngredientId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: 'ingredients',
  }
);

IngredientsItemSchema.index({ IngredientEn: 'text', IngredientId: 'text' });

const IngredientsItem = mongoose.model('IngredientsItem', IngredientsItemSchema);

export default IngredientsItem;
