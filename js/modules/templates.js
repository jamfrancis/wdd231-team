/**
 * Templates module for weather display
 * Contains reusable HTML templates for different weather components
 */

/**
 * Creates a template for hourly forecast item
 * @param {Object} hour - Hourly forecast data
 * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {string} timezone - Timezone of the location
 * @param {boolean} isNow - Whether this is the current hour
 * @returns {string} HTML template for hourly forecast
 */
export function hourlyForecastTemplate(hour, unit, timezone, isNow = false) {
    const date = new Date(hour.time);
    const options = {
        hour: 'numeric',
        hour12: true,
        timeZone: timezone
    };
    const formattedTime = isNow ? 'Now' : date.toLocaleTimeString('en-US', options);
    
    const temp = unit === 'celsius' ? `${Math.round(hour.temp_c)}°C` : `${Math.round(hour.temp_f)}°F`;
    
    return `
        <div class="hour-block">
            <span class="time">${formattedTime}</span>
            <img class="ConditionHourImg" src="${hour.condition.icon}" alt="${hour.condition.text}">
            <span class="temperature">${temp}</span>
        </div>
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