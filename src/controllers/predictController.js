const predictHandler = async (request, h) => {
  const { bahan, dose } = request.payload;

  if (!bahan || !dose) {
    return h
      .response({
        success: "false",
        message: "Bahan or Dose is Required",
      })
      .code(400);
  }

  try {
    const response = await fetch(process.env.ML_API_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  } catch (error) {}
};
