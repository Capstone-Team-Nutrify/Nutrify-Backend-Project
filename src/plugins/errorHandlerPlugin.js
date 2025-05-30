/* eslint-disable indent */
export const errorHandlerPlugin = {
  name: 'errorHandlerPlugin',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onPreResponse', (request, h) => {
      const response = request.response;

      if (response.isBoom) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Server Error (Boom) - Original:', {
            path: request.path,
            statusCode: response.output.statusCode,
            error: response.output.payload.error,
            message: response.message || response.output.payload.message,
            data: response.data,
            stack: response.stack,
          });
        }

        const statusCode = response.output.statusCode;
        let customMessage;
        let status = 'fail';

        switch (statusCode) {
          case 400:
            customMessage = response.output.payload.message || 'Permintaan tidak valid atau input salah.';
            break;
          case 401:
            customMessage = 'Token tidak valid, kedaluwarsa, atau Anda belum login.';

            h.unstate('jwt', { path: '/', isSecure: process.env.NODE_ENV === 'production', isSameSite: 'Lax' });
            break;
          case 403:
            customMessage = 'Anda tidak memiliki izin untuk mengakses sumber daya ini.';

            break;
          case 404:
            customMessage = 'Sumber daya yang diminta tidak ditemukan.';

            break;
          case 409:
            customMessage = response.output.payload.message || 'Terjadi konflik dengan data yang sudah ada.';

            break;
          case 413:
            customMessage = 'Ukuran payload atau file terlalu besar dari yang diizinkan.';

            break;
          case 500:
            customMessage = 'Terjadi kesalahan internal pada server.';
            if (process.env.NODE_ENV !== 'production') {
              customMessage = response.output.payload.message || 'Terjadi kesalahan internal pada server (dev).';
            }

            break;
          default:
            customMessage = response.output.payload.message || 'Terjadi kesalahan.';
            if (statusCode >= 400 && statusCode < 500) {
              status = 'fail';
            } else if (statusCode >= 500) {
              status = 'error';
            } else {
              status = 'error';
            }
            break;
        }

        const newResponse = h
          .response({
            status: status,
            message: customMessage,
          })
          .code(statusCode);

        Object.keys(response.output.headers).forEach((headerKey) => {
          if (!newResponse.headers[headerKey]) {
            newResponse.header(headerKey, response.output.headers[headerKey]);
          }
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log('Server Error (Boom) - Custom Response:', newResponse.source);
        }

        return newResponse;
      }

      const isLogout = request.path === '/api/auth/logout';
      if (!isLogout && request.auth?.isAuthenticated && request.auth.strategy === 'jwt' && request.state?.jwt) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Refreshing JWT cookie TTL for path:', request.path);
        }
        h.state('jwt', request.state.jwt, {
          ttl: 6 * 24 * 60 * 60 * 1000,
          isSecure: process.env.NODE_ENV === 'production',
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
