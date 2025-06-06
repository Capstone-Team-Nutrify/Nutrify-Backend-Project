import axios from 'axios';

export const getPredictionFromML = async (ingredientsData) => {
  try {

    const foodPayload = ingredientsData.map(item => ({
      ingredient: item.name, 
      dose: item.dose        
    }));

    const response = await axios.post(
      process.env.ML_API_URI,
      {
        food: foodPayload, 
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
    console.error('Error in getPredictionFromML:', error.message);
    if (error.response) {
      console.error('DEBUG: ML Service Error Response:');
    }
    const message = error.response?.data?.message || 'ML API error';
    throw new Error(message);
  }
};