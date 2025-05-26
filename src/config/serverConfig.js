export const serverConfig = {
  port: process.env.PORT,
  host: 'localhost',
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
      headers: ['Accept', 'Content-Type', 'Authorization'],
    },
    validate: {
      failAction: (request, h, err) => {
        console.error('Validation error:', err.message);
        throw err;
      },
    },
  },
  debug: { request: ['error'] },
};
