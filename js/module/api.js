
const API_KEY = '1fd318216517486e994181149252802';
const BASE_URL = 'https://api.weatherapi.com/v1';

/**
 * fetches current weather data for the specified location
 * @param {string} location 
 * @returns {Promise} - a promise containing weather data
 */
export async function getCurrentWeather(location) {
  try {
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * fetches forecast weather data for the specified location
 * @param {string} location 
 * @param {number} days - number of days to forecast (1-10)
 * @returns {Promise} - a promise containing forecast data
 */
export async function getForecast(location, days = 7) {
  try {
    const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=${days}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}