export const serverConfig = {
  port: process.env.PORT,
  host: process.env.HOST || '0.0.0.0',
  routes: {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://www.nutrify.web.id',
        'http://api.nutrify.web.id',
        'https://nutrify-083.et.r.appspot.com'
      ],
      credentials: true,
      headers: ['Accept', 'Content-Type', 'Authorization', 'Origin', 'X-Requested-With'],
      additionalHeaders: ['cache-control', 'x-requested-with'],
    },
    validate: {
      failAction: async (request, h, err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Validation error details:', err.details);
        }
        throw err;
      },
    },
    payload: {
      maxBytes: 10 * 1024 * 1024,
    },
  },
  debug: process.env.NODE_ENV !== 'production' ? { request: ['error'] } : false,
};
