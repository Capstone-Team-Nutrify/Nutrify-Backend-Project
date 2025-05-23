import "dotenv/config";
import Hapi from "@hapi/hapi";
import { connectDB } from "./config/db.js";
import { serverConfig } from "./config/serverConfig.js";
import { cookieStrategy } from "./config/authConfig.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { notFoundHandler } from "./utils/responseHandler.js";
import cookie from "@hapi/cookie";
import  jwtStrategy  from "./strategies/jwtStrategy.js";
import { errorHandlerPlugin } from "./utils/errorHandler.js";
import  swaggerPlugin  from "./plugins/swagger.js";

const init = async () => {
  const server = Hapi.server(serverConfig);

  // Registrasi Plugin
  await server.register([
    cookie,
    jwtStrategy,
    errorHandlerPlugin,
    swaggerPlugin
  ]);

  // Setup Autentikasi
  server.auth.strategy(cookieStrategy.name, cookieStrategy.scheme, cookieStrategy.options);
  server.auth.default("jwt");

  // Koneksi Database
  await connectDB();

  // Setup Routes
  server.route([
    ...authRoutes,
    ...userRoutes,
    {
      method: "*",
      path: "/{any*}",
      handler: (request, h) => notFoundHandler(request, h),
    }
  ]);

  // Start Server
  await server.start();
  console.log(`Server Berjalan di ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
  process.exit(1);
});

init();