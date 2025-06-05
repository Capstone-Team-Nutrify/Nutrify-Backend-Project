import axios from 'axios';

export const getPredictionFromML = async (foodList) => {
  try {
    const response = await axios.post(
      process.env.ML_API_URI,
      {
        food: foodList,
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
