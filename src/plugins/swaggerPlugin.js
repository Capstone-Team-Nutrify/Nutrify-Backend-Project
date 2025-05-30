import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';

const swaggerPlugin = {
  name: 'swaggerPlugin',
  register: async (server) => {
    const swaggerOptions = {
      info: {
        title: 'Nutrify API Documentation',
        version: '1.0.0',
        description: "Dokumentasi API untuk aplikasi Nutrify. Token JWT akan di-set sebagai cookie 'jwt' saat login dan dapat juga dikirim via header 'Authorization: Bearer {token}'.",
      },
      securityDefinitions: {
        jwt: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: "Masukkan token JWT dengan format: Bearer {token}. Cookie 'jwt' juga akan dibaca otomatis.",
        },
      },
      security: [{ jwt: [] }],
      grouping: 'tags',
      sortEndpoints: 'ordered',
      tags: [
        { name: 'auth', description: 'Endpoint untuk autentikasi dan manajemen profil pengguna' },
        { name: 'admin', description: 'Endpoint khusus untuk administrasi (membutuhkan hak admin)' },
        { name: 'food-items', description: 'Endpoint untuk makanan dan minuman' },
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
