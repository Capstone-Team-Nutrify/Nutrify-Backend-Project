import { allUsers } from '../controllers/userController.js';

export default [
  {
    method: 'GET',
    path: '/api/users',
    options: {
      auth: {
        strategy: 'jwt',
        scope: ['admin']
      },
      handler: allUsers
    }
  }
];