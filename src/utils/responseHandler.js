export const errorHandlerPlugin = {
  name: 'error-handler-plugin',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onPreResponse', (request, h) => {
      const response = request.response;

      if (response.isBoom) {
        console.error('Error details:', {
          path: request.path,
          statusCode: response.output.statusCode,
          error: response.output.payload.error,
          message: response.message || response.output.payload.message,
        });
      }

      if (response.name === 'ValidationError' && response.isJoi) {
        console.error('Joi validation error:', response.details);
        return h
          .response({
            status: 'error',
            message: 'Kesalahan validasi server',
            data: null,
          })
          .code(500);
      }

      if (response.isBoom && response.output.statusCode === 400) {
        return h
          .response({
            status: 'error',
            message: 'Bad Request',
            data: null,
          })
          .code(400);
      }

      if (response.isBoom && response.output.statusCode === 401) {
        return h
          .response({
            status: 'error',
            message: 'Token tidak valid atau belum login',
            data: null,
          })
          .code(401);
      }

      if (response.isBoom && response.output.statusCode === 404) {
        return h
          .response({
            status: 'error',
            message: 'Halaman tidak ditemukan',
            data: null,
          })
          .code(404);
      }

      if (response.isBoom && response.output.statusCode === 500) {
        console.error('Server error details:', {
          message: response.message,
          stack: response.stack,
        });

        return h
          .response({
            status: 'error',
            message: 'Terjadi kesalahan pada server',
            data: null,
          })
          .code(500);
      }

      const isLogout = request.path === '/api/auth/logout';
      if (!isLogout && request.auth?.isAuthenticated && request.auth.strategy === 'jwt' && request.state?.jwt) {
        h.state('jwt', request.state.jwt, {
          ttl: 6 * 24 * 60 * 60 * 1000,
          isSecure: false,
          isHttpOnly: true,
          encoding: 'none',
          isSameSite: 'Lax',
          path: '/',
        });
      }
      return h.continue;
    });
  },
};
