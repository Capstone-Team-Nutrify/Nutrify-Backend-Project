import jwt from "hapi-auth-jwt2";
import User from "../models/User.js";

const plugin = {
  name: "jwt-auth",
  register: async (server) => {
    await server.register(jwt);

    server.auth.strategy("jwt", "jwt", {
      key: process.env.JWT_SECRET,
      validate: async (decoded, request, h) => {
        try {
          console.log("JWT validation started for:", decoded);
          
          if (!decoded || !decoded.id) {
            console.log("Invalid decoded token - missing id");
            return { isValid: false };
          }

          const user = await User.findById(decoded.id);
          if (!user) {
            console.log("User not found for id:", decoded.id);
            return { isValid: false };
          }

          console.log("JWT validation successful for user:", user._id);
          return {
            isValid: true,
            credentials: {
              id: user._id,
            },
          };
        } catch (err) {
          console.error("JWT validation error:", err);
          return { isValid: false };
        }
      },
      verifyOptions: { algorithms: ["HS256"] },
      tokenType: "Bearer",
      headerKey: "authorization",
      cookieKey: "jwt",
      complete: false,
      keepCredentials: true,
      
      unauthorizedFunc: (message, scheme, attributes) => {
        console.log("JWT unauthorized:", { message, scheme, attributes });
        return {
          error: 'Unauthorized',
          message: 'Token tidak valid atau belum login'
        };
      }
    });

    server.events.on('request', (request, event) => {
      if (event.tags && event.tags.includes('auth')) {
        console.log('Auth event:', {
          path: request.path,
          method: request.method,
          auth: request.auth,
          cookies: request.state,
          timestamp: new Date().toISOString()
        });
      }
    });
  },
};

export default plugin;