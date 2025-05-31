import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import HapiSwagger from "hapi-swagger";

const swaggerPlugin = {
  name: "swaggerPlugin",
  register: async (server) => {
    const swaggerOptions = {
      info: {
        title: "Nutrify API Documentation",
        version: "1.0.0",
        description: "Dokumentasi API untuk aplikasi Nutrify...",
      },
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Masukkan token JWT dengan format: Bearer {token}...",
        },
      },
      security: [{ jwt: [] }],
      grouping: "tags",
      sortEndpoints: "ordered",
      tags: [
        { name: "auth", description: "Endpoint untuk autentikasi dan manajemen profil pengguna" },
        { name: "admin", description: "Endpoint khusus untuk administrasi (Admin only)" },
        { name: "food-items", description: "Endpoint untuk makanan dan minuman publik" },
        { name: "moderation", description: "Endpoint untuk moderasi konten makanan (Admin/Moderator only)" }
      ],
    };

    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions,
      },
    ]);
  },
};

export default swaggerPlugin;