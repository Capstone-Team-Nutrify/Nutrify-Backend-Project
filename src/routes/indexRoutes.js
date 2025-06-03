// ✅ BENAR - ini array berisi satu route
export const indexRoutes = [
  {
    method: "GET",
    path: "/",
    options: {
      auth: false,
      description: "Root endpoint",
      tags: ["api"],
      handler: (_request, h) => {
        return h.response({
          status: {
            code: 200,
            message: "Welcome to the Backend API NutriFy",
            teamName: "CC25-CF083",
          },
        });
      },
    },
  },
];
