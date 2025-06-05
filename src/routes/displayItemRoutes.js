import { getIngredients } from '../controllers/displayItemController.js';
import Joi from 'joi';

const displayItemRoutes = [
  {
    method: 'GET',
    path: '/api/display-ingredients',
    handler: getIngredients,
    options: {
      description: 'Get 50 ingredients with search functionality',
      tags: ['api', 'ingredients'],
      auth: false,
      validate: {
        query: Joi.object({
          search: Joi.string().optional(),
          page: Joi.number().optional(),
        }),
      },
    },
  },
];

export default displayItemRoutes;
