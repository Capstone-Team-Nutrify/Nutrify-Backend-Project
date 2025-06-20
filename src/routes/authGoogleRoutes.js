import { googleCallback, authorizationUrl } from '../controllers/authGoogleController.js';

const authGoogle = [
  {
    method: 'GET',
    path: '/auth/google',
    handler: authorizationUrl,
    options: {
      description: 'Authentication OAuth 2.0 Google',
      tags: ['api'],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/auth/google/callback',
    handler: googleCallback,
    options: {
      description: 'Handle callback setelah login Google',
      tags: ['api'],
      auth: false,
    },
  },
];

export default authGoogle;
