export const predictHandler = async (request, h) => {
  const { ingeredient, dose } = request.payload;

  if (
    !Array.isArray(ingeredient) ||
    !Array.isArray(dose) ||
    ingeredient.length === 0 ||
    dose.length === 0
  ) {
    return h
      .response({
        success: false,
        message: "ingeredient and Dose must be non-empty arrays",
      })
      .code(400);
  }

  try {
    const predictionResult = await getPredictionFromML(ingeredient, dose);

    return h
      .response({
        success: true,
        input_ingeredient: ingeredient,
        input_dose: dose,
        prediction: predictionResult,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        success: false,
        message: "Failed to get prediction from ML API",
        error: err.message,
      })
      .code(500);
  }
};
