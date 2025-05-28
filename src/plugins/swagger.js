import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import HapiSwagger from "hapi-swagger";

const swaggerPlugin = {
  name: "app-swagger",
  register: async (server) => {
    const swaggerOptions = {
      info: {
        title: "Nutrify API Documentation",
        version: "1.0.0",
        description: "Dokumentasi API untuk aplikasi Nutrify",
      },
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Use format: Bearer {token} (token stored in cookie 'jwt')",
        },
      },
      security: [{ jwt: [] }],
      grouping: "tags",
      sortEndpoints: "ordered",
      tags: [
        { name: "auth", description: "Endpoints for authentication and user profile management" },
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