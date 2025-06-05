import { getRandomItems } from '../controllers/randomItemController.js';

const randomItemRoutes = [
  {
    method: 'GET',
    path: '/api/random-items',
    handler: getRandomItems,
    options: {
      description: 'Get 10 random items',
      tags: ['api', 'random-items'],
      auth: false,
    },
  },
];

export default randomItemRoutes;
