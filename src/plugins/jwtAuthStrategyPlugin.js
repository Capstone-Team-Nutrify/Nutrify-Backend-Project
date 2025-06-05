import jwt from "hapi-auth-jwt2";
import User from "../models/user.js";

const plugin = {
  name: 'jwtAuthStrategyPlugin',
  register: async (server) => {
    await server.register(jwt);

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: async (decoded, request, h) => {
        try {
          if (process.env.NODE_ENV !== "production") {
            console.log("JWT validation: decoded token:", decoded);
          }

          if (!decoded || !decoded.id) {
            if (process.env.NODE_ENV !== "production") {
              console.log(
                "JWT validation: Invalid decoded token - missing id."
              );
            }
            return { isValid: false };
          }

          const user = await User.findById(decoded.id).select("+role");
          if (!user) {
            if (process.env.NODE_ENV !== "production") {
              console.log("JWT validation: User not found for id:", decoded.id);
            }
            return { isValid: false };
          }

          if (process.env.NODE_ENV !== "production") {
            console.log(
              "JWT validation: Successful for user_id:",
              user._id,
              "with role:",
              user.role
            );
          }
          return {
            isValid: true,
            credentials: {
              id: user._id.toString(),
              role: user.role,
            },
          };
        } catch (err) {
          console.error('JWT validation error:', err.message);
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

    if (process.env.NODE_ENV !== "production") {
      server.events.on("request", (request, event) => {
        if (event.tags && event.tags.includes("auth")) {
          console.log("Auth event:", {
            path: request.path,
            method: request.method,
            auth: request.auth,
            cookies: request.state,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  },
};

export default plugin;
