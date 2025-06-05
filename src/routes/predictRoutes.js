import { predictHandler } from "../controllers/predictController.js";

const predictionRoutes = [
  {
    method: "POST",
    path: "/predict",
    handler: predictHandler,
    options: {
      description: "Prediction disease rate from ML API",
      tags: ["api"],
      auth: false,
    },
  },
];

export default predictionRoutes;
