import { getPredictionFromML } from '../services/mlService';

export const predictHandler = async (request, h) => {
  const { ingredients } = request.payload;

  if (
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    ingredients.some(
      (ing) =>
        typeof ing.ingredientName !== 'string' ||
        typeof ing.ingredientDose !== 'number'
    )
  ) {
    return h
      .response({
        success: false,
        message:
          'ingredients must be a non-empty array of { ingredientName, ingredientDose } objects',
      })
      .code(400);
  }

  try {
    const prediction = await getPredictionFromML(
      ingredients.map((ing) => ({
        ingredient: ing.ingredientName,
        dose: ing.ingredientDose,
      }))
    );

    return h
      .response({
        success: true,
        inputIngredients: ingredients,
        prediction,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        success: false,
        message: 'Failed to get prediction from ML API',
        error: err.message,
      })
      .code(500);
  }
};
