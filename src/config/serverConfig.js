export const serverConfig = {
  port: process.env.PORT,
  host: "localhost",
  routes: {
    cors: {
      origin: ["*"],
      credentials: true,
      headers: ["Accept", "Content-Type", "Authorization"],
    },
    validate: {
      failAction: (request, h, err) => {
        console.error("Validation error:", err.message);
        throw err;
      }
    },
    payload: {
      maxBytes: 10 * 1024 * 1024 
    }
  },
  debug: { request: ['error'] }
};