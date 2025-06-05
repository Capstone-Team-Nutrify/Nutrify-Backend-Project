import IngredientsItem from '../models/ingredientItems.js';

export const getIngredients = async (request, h) => {
  try {
    const { search } = request.query;
    const page = parseInt(request.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    // Normalisasi keyword pencarian: lowercase, hapus spasi, underscore, dash
    const normalizedSearch = search
      ? search.toLowerCase().replace(/[\s_-]/g, '')
      : null;

    // Aggregation pipeline
    const pipeline = [];

    if (normalizedSearch) {
      pipeline.push({
        $addFields: {
          normalizedIngredientEn: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: { $toLower: '$IngredientEn' },
                      find: ' ',
                      replacement: '',
                    },
                  },
                  find: '_',
                  replacement: '',
                },
              },
              find: '-',
              replacement: '',
            },
          },
          normalizedIngredientId: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: { $toLower: '$IngredientId' },
                      find: ' ',
                      replacement: '',
                    },
                  },
                  find: '_',
                  replacement: '',
                },
              },
              find: '-',
              replacement: '',
            },
          },
        },
      });

      pipeline.push({
        $match: {
          $or: [
            {
              normalizedIngredientEn: {
                $regex: normalizedSearch,
                $options: 'i',
              },
            },
            {
              normalizedIngredientId: {
                $regex: normalizedSearch,
                $options: 'i',
              },
            },
          ],
        },
      });
    }

    pipeline.push({ $sort: { IngredientEn: 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const ingredients = await IngredientsItem.aggregate(pipeline);

    // Total count untuk pagination (hitung setelah filter)
    const total = await IngredientsItem.aggregate([
      ...pipeline.slice(0, pipeline.length - 3), // tanpa $skip dan $limit
      { $count: 'count' },
    ]);
    const totalCount = total[0]?.count || 0;

    return h
      .response({
        success: true,
        data: ingredients.map((item) => ({
          _id: item._id,
          IngredientEn: item.IngredientEn,
          IngredientId: item.IngredientId,
        })),
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        success: false,
        message: 'Error fetching ingredients',
        error: error.message,
      })
      .code(500);
  }
};
