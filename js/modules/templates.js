/**
 * Templates module for weather display
 * Contains reusable HTML templates for different weather components
 */

/**
 * Creates a template for hourly forecast item
 * @param {Object} hour - Hourly forecast data
 * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
 * @param {boolean} isNow - Whether this is the current hour
 * @returns {string} HTML template for hourly forecast
 */
export function hourlyForecastTemplate(hour, unit, isNow = false) {
    const time = new Date(hour.time);
    let formattedTime;

    if (isNow) {
        formattedTime = 'Now';
    } else {
        const hours = time.getHours();
        formattedTime = hours === 0 ? '12 AM' :
            hours < 12 ? `${hours} AM` :
            hours === 12 ? '12 PM' :
            `${hours - 12} PM`;
    }

    const temp = unit === 'celsius'
        ? `${Math.round(hour.temp_c)}°C`
        : `${Math.round(hour.temp_f)}°F`;

    return `
        <div class="hour-block">
            <span class="time">${formattedTime}</span>
            <img class="ConditionHourImg" src="${hour.condition.icon}" alt="${hour.condition.text}">
            <span class="temperature">${temp}</span>
        </div>
    `;
}
  
/**
 * Creates a template for daily forecast card
 * @param {Object} day - Daily forecast data
 * @param {string} unit - Temperature unit ('celsius' or 'fahrenheit')
 * @returns {string} HTML template for daily forecast card
 */
export function dailyForecastTemplate(day, unit) {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const highTemp = Math.round(unit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f);
    const lowTemp = Math.round(unit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f);
    const unitLabel = unit === 'celsius' ? 'C' : 'F';
    const condition = day.day.condition.text;
    const icon = day.day.condition.icon;

    return `
        <div class="forecast-card">
            <div class="forecast-date">${dayName}</div>
            <img src="${icon}" alt="${condition}" class="forecast-icon">
            <div class="forecast-details">
                <div class="forecast-temp">${highTemp}°${unitLabel} / ${lowTemp}°${unitLabel}</div>
                <div class="forecast-condition">${condition}</div>
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