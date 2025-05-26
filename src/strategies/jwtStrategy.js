import jwt from 'hapi-auth-jwt2';
import User from '../models/User.js';

const plugin = {
  name: 'jwt-auth',
  register: async (server) => {
    await server.register(jwt);

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: async (decoded, request, h) => {
        try {
          const user = await User.findById(decoded.id);
          if (!user) {
            return { isValid: false };
          }

          return {
            isValid: true,
            credentials: {
              id: user._id,
            },
          };
        } catch (err) {
          console.error('JWT validation error:', err);
          return { isValid: false };
        }
      },
      verifyOptions: { algorithms: ['HS256'] },
      tokenType: 'Bearer',
      headerKey: 'authorization',
      cookieKey: 'jwt',
      complete: false,
      keepCredentials: true,
    });
  },
};

export default plugin;
