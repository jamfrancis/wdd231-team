/**
 * Templates module for weather display
 * Contains reusable HTML templates for different weather components
 */

/**
 * Creates a template for hourly forecast item
 * @param {Object} hour - Hourly forecast data
 * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
 * @returns {string} HTML template for hourly forecast
 */
export function hourlyForecastTemplate(hour, unit) {
    const hourTime = new Date(hour.time).getHours();
    const formattedTime = hourTime === 0 ? '12 AM' : 
                           hourTime < 12 ? `${hourTime} AM` : 
                           hourTime === 12 ? '12 PM' : 
                           `${hourTime - 12} PM`;
    
    const temp = unit === 'celsius' ? `${hour.temp_c}°C` : `${hour.temp_f}°F`;
    
    return `
      <img class="ConditionHourImg" src="${hour.condition.icon}" alt="${hour.condition.text}" width="50%">
      <p class="data">${formattedTime}: ${temp}</p>
    `;
  }
  
  /**
   * Creates a template for daily forecast item
   * @param {Object} day - Daily forecast data
   * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
   * @returns {string} HTML template for daily forecast
   */
  export function dailyForecastTemplate(day, unit) {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const maxTemp = unit === 'celsius' ? `${day.day.maxtemp_c}°C` : `${day.day.maxtemp_f}°F`;
    const minTemp = unit === 'celsius' ? `${day.day.mintemp_c}°C` : `${day.day.mintemp_f}°F`;
    
    return `
      <div class="forecast-day">
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" width="50">
        <div class="forecast-details">
          <div class="forecast-date">${dayName}, ${formattedDate}</div>
          <div class="forecast-condition">${day.day.condition.text}</div>
          <div class="forecast-temp">High: ${maxTemp} | Low: ${minTemp}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Creates a template for detailed condition item
   * @param {string} label - Label for the condition
   * @param {string|number} value - Value of the condition
   * @returns {string} HTML template for detailed condition
   */
  export function detailedConditionTemplate(label, value) {
    return `<strong>${label}:</strong> ${value}`;
  }