import "dotenv/config";
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";

import { connectDB } from "./config/db.js";
import { serverConfig } from "./config/serverConfig.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import foodItemRoutes from "./routes/FoodItemRoutes.js";
import moderationRoutes from "./routes/moderationRoutes.js";
import cookie from "@hapi/cookie";
import jwtAuthStrategyPlugin from "./plugins/jwtAuthStrategyPlugin.js";
import { errorHandlerPlugin } from "./plugins/errorHandlerPlugin.js";
import swaggerPlugin from "./plugins/swaggerPlugin.js";

const init = async () => {
  const server = Hapi.server(serverConfig);

  // Registrasi Plugin
  await server.register([
    Inert,
    cookie,
    jwtAuthStrategyPlugin,
    errorHandlerPlugin,
    swaggerPlugin,
  ]);

  // Setup Autentikasi
  server.auth.default("jwt");

  // Koneksi Database
  await connectDB();

  // Setup Routes
  server.route([
    ...authRoutes,
    ...adminRoutes,
    ...foodItemRoutes,
    ...moderationRoutes,
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