import axios from 'axios';

export const getPredictionFromML = async (ingredient, dose) => {
  try {
    const response = await axios.post(
      process.env.ML_API_URI,
      {
        food: [
          {
            ingredient,
            dose,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'ML API error';
    throw new Error(message);
  }
};
