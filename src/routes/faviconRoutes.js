const faviconRoutes = [
  {
    method: 'GET',
    path: '/favicon.ico',
    handler: (request, h) => {
      // kosongkan dengan status 204 No Content
      return h.response().code(204);
    },
  },
];

export default faviconRoutes;
