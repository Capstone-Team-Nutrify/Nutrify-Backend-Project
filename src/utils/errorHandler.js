export const errorHandlerPlugin = {
    name: 'error-handler-plugin',
    version: '1.0.0',
    register: async (server) => {
        server.ext('onPreResponse', (request, h) => {
            const response = request.response;
            
            if (response.isBoom) {
                console.error('Error:', {
                    path: request.path,
                    statusCode: response.output.statusCode,
                    message: response.message || response.output.payload.message
                });
                
            }

            if (response.name === 'ValidationError' && response.isJoi) {
                return h.continue;
            }


            if (response.isBoom && response.output.statusCode === 401) {
                return h.response({
                    status: 'error',
                    message: 'Token tidak valid atau belum login'
                }).code(401);
            }

            if (response.isBoom && response.output.statusCode === 404) {
                return h.response({
                    status: 'error',
                    message: 'Halaman tidak ditemukan'
                }).code(404);
            }

            if (response.isBoom && response.output.statusCode === 413) {
                return h.response({
                    status: 'error',
                    message: 'Ukuran file tidak boleh lebih dari 5MB'
                }).code(413);
            }


            if (response.isBoom && response.output.statusCode === 500) {
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan pada server'
                }).code(500);
            }

            const isLogout = request.path === '/api/auth/logout';
            if (
                !isLogout &&
                request.auth?.isAuthenticated &&
                request.auth.strategy === 'jwt' &&
                request.state?.jwt
            ) {
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