import 'dotenv/config';
import Hapi from '@hapi/hapi';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jwtStrategy from './strategies/jwtStrategy.js';
import cookie from '@hapi/cookie';
import jwt from 'jsonwebtoken'; 
import { notFoundHandler } from './utils/responseHandler.js';

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'], 
                credentials: true,
                headers: ['Accept', 'Content-Type', 'Authorization']
            }
        }
    });

    await server.register([cookie, jwtStrategy]);
    
    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'jwt',
            password: process.env.JWT_SECRET,
            isSecure: false,
            path: '/',
            ttl: 6 * 24 * 60 * 60 * 1000,
            clearInvalid: true
        },
        validate: async (request, session) => {
            try {
                const decoded = jwt.verify(session.token, process.env.JWT_SECRET);
                return { isValid: true, credentials: decoded };
            } catch (err) {
                return { isValid: false };
            }
        }
    });

    server.auth.default('jwt');

    await connectDB();

    server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    
    if (request.path === '/api/auth/logout') {
        return h.continue;
    }
    
    if (request.state && request.state.jwt) {
        console.log(`Preserving JWT cookie for path: ${request.path}`);
        h.state('jwt', request.state.jwt, {
            ttl: 6 * 24 * 60 * 60 * 1000,
            isSecure: false,
            isHttpOnly: true,
            encoding: 'none',
            isSameSite: 'Lax',
            path: '/'
        });
    }
    
    return h.continue;
});

    server.route([...authRoutes, ...userRoutes]);

    server.route({
        method: '*',
        path: '/{any*}',
        handler: (request, h) => notFoundHandler(request, h)
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled promise rejection:', err);
    process.exit(1);
});

init();
