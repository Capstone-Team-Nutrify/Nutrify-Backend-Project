export const serverConfig = {
  port: process.env.PORT,
  host: process.env.HOST,
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
      headers: ['Accept', 'Content-Type', 'Authorization'],
    },
    validate: {
      failAction: async (request, h, err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Validation error details:', err.details);
        }
        throw err;
      }
    },
    payload: {
      maxBytes: 10 * 1024 * 1024,
    }
  },
  debug: process.env.NODE_ENV !== 'production' ? { request: ['error'] } : false,
};