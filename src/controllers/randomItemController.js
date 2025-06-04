import Item from "../models/items.js";

export const getRandomItems = async (request, h) => {
  try {
    const randomItems = await Item.aggregate([
      { $match: { isPublic: true } },
      { $sample: { size: 10 } },
    ]);

    if (!randomItems || randomItems.length === 0) {
      return h
        .response({
          success: false,
          message: "No items found",
        })
        .code(404);
    }

    return h
      .response({
        success: true,
        data: randomItems,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        success: false,
        message: "Error fetching random items",
        error: error.message,
      })
      .code(500);
  }
};
