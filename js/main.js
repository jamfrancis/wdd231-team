import { getCurrentWeather, getForecast } from './modules/api.js';
import {
  getFavoriteLocation,
  saveFavoriteLocation,
  getTemperatureUnit,
  saveTemperatureUnit
} from './modules/storage.js';
import {
  hourlyForecastTemplate,
  dailyForecastTemplate,
  detailedConditionTemplate
} from './modules/templates.js';

// DOM elements
const searchForm = document.getElementById('search-form');
const logo = document.getElementById('logo');
const locationInput = document.getElementById('location-input');
const errorContainer = document.getElementById('search-error');

// Add event listeners
searchForm.addEventListener('submit', handleSearch);

// Check for temperature unit toggle if it exists
const unitToggle = document.getElementById('unit-toggle');
if (unitToggle) {
  unitToggle.addEventListener('change', handleUnitToggle);
  // Set initial state based on stored preference
  unitToggle.checked = getTemperatureUnit() === 'celsius';
}

// Initialize the app
initializeApp();

/**
 * Initializes the app by loading data based on URL or stored preferences
 */
function initializeApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const locationParam = urlParams.get('location');

  if (locationParam) {
    // Load weather data based on URL parameter
    loadWeatherData(locationParam);
    // Update the search input to match the URL parameter
    locationInput.value = locationParam;
  } else {
    // Use the location from localStorage
    const favoriteLocation = getFavoriteLocation();

    if (favoriteLocation) {
      loadWeatherData(favoriteLocation);
      updateURL(favoriteLocation);
      locationInput.value = favoriteLocation;
    } else {
      // Default location
      const defaultLocation = "Rexburg, Idaho";
      loadWeatherData(defaultLocation);
      updateURL(defaultLocation);
      locationInput.value = defaultLocation;
    }
  }
}

/**
 * Handles search form submission
 * @param {Event} event
 */
function handleSearch(event) {
  event.preventDefault();

  const location = locationInput.value.trim();

  if (location) {
    loadWeatherData(location);
    updateURL(location);
  } else {
    displayError("Please enter a location");
  }
}

/**
 * Handles temperature unit toggle
 * @param {Event} event
 */
function handleUnitToggle(event) {
  const unit = event.target.checked ? 'celsius' : 'fahrenheit';
  saveTemperatureUnit(unit);

  // Reload current weather data to update the display with new unit
  const currentLocation = locationInput.value.trim() || getFavoriteLocation() || "Rexburg, Idaho";
  loadWeatherData(currentLocation);
}

/**
 * loads data for the location
 * @param {string} location 
 */
async function loadWeatherData(location) {
  try {
    // show loading state
    document.body.classList.add('loading');

    // fetch current weather and forecast
    const currentData = await getCurrentWeather(location);
    const forecastData = await getForecast(location);

    // update the UI with the fetched data
    updateWeatherDisplay(currentData, forecastData);

    // save to localStorage
    saveFavoriteLocation(location);

    // remove loading state
    document.body.classList.remove('loading');
  } catch (error) {
    // catch errors
    document.body.classList.remove('loading');
    displayError(`Could not load weather for "${location}". Please try another location.`);
    console.error('Error loading weather data:', error);
  }
}

/**
 * updates the URL with the location parameter
 * @param {string} location
 */
function updateURL(location) {
  const url = new URL(window.location);
  url.searchParams.set('location', location);
  window.history.pushState({}, '', url);
}

/**
 * update the UI with current weather and forecast data
 * @param {Object} currentData - current weather data from API
 * @param {Object} forecastData - forecast data from API
 */
function updateWeatherDisplay(currentData, forecastData) {
  // update current weather condition
  updateCurrentWeather(currentData);

  // update hourly forecast
  updateHourlyForecast(forecastData);

  // update 7-day forecast
  updateDailyForecast(forecastData);

  // update conditions
  updateDetailedConditions(currentData);
}

/**
 * update the current weather section
 * @param {Object} data - current weather
 */
function updateCurrentWeather(data) {
  const currentLocation = `${data.location.name}, ${data.location.region}`;
  const currentTemp = getTemperatureUnit() === 'celsius'
    ? `${data.current.temp_c}°C`
    : `${data.current.temp_f}°F`;
  const currentCondition = data.current.condition.text;

  // update the heading text
  const conditionText = document.querySelector('.ConditionCurrentText');
  conditionText.textContent = `${currentTemp} in ${currentLocation} - ${currentCondition}`;

  // update the condition image
  const conditionImg = document.querySelector('.ConditionCurrentImg');
  conditionImg.src = data.current.condition.icon;
  conditionImg.alt = currentCondition;
}

/**
 * updates the hourly forecast 
 * @param {Object} data - forecast 
 */
function updateHourlyForecast(data) {
  // get next 9 hours from the forecast
  const hourlyForecast = data.forecast.forecastday[0].hour
    .filter(hour => {
      const hourTime = new Date(hour.time).getHours();
      const currentHour = new Date().getHours();
      return hourTime >= currentHour;
    })
    .slice(0, 9);

    if (currentHout > 6 || currentHout < 13){
      logo.setAttribute('src', 'assets\icon day.png');
    }
    else if (currentHour >= 13 && currentHour < 6){
      logo.setAttribute('src', 'assets\\icon night.png');
    } else {
      logo.setAttribute('src', 'assets\\icon weird.png');
    }
  // adds the next day's hours if the current day's hours are less than 9
  if (hourlyForecast.length < 9 && data.forecast.forecastday.length > 1) {
    const nextDayHours = data.forecast.forecastday[1].hour.slice(0, 9 - hourlyForecast.length);
    hourlyForecast.push(...nextDayHours);
  }

  // update each hour's display
  const hourlyContainers = document.querySelectorAll('.hourcondition');
  hourlyForecast.forEach((hour, index) => {
    if (index < hourlyContainers.length) {
      const container = hourlyContainers[index];
      const img = container.querySelector('.ConditionHourImg');
      const text = container.querySelector('.data');

      // format the time
      const hourTime = new Date(hour.time).getHours();
      const formattedTime = hourTime === 0 ? '12 AM' :
        hourTime < 12 ? `${hourTime} AM` :
          hourTime === 12 ? '12 PM' :
            `${hourTime - 12} PM`;

      // get temperature based on user preference
      const temp = getTemperatureUnit() === 'celsius'
        ? `${hour.temp_c}°C`
        : `${hour.temp_f}°F`;

      // update elements
      img.src = hour.condition.icon;
      img.alt = hour.condition.text;
      text.textContent = `${formattedTime}: ${temp}`;
    }
  });
}

/**
 * updates the 7-day forecast section
 * @param {Object} data - forecast
 */
function updateDailyForecast(data) {
  const forecastContainer = document.querySelector('.DailyForecast');

  // clear existing forecast items (except the heading)
  const heading = forecastContainer.querySelector('.ForcastDailyH1');
  forecastContainer.innerHTML = '';
  forecastContainer.appendChild(heading);

  // add forecast for each day
  data.forecast.forecastday.forEach((day, index) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // get temperature based on user preference
    const maxTemp = getTemperatureUnit() === 'celsius'
      ? `${day.day.maxtemp_c}°C`
      : `${day.day.maxtemp_f}°F`;
    const minTemp = getTemperatureUnit() === 'celsius'
      ? `${day.day.mintemp_c}°C`
      : `${day.day.mintemp_f}°F`;

    // create forecast item
    const forecastItem = document.createElement('li');
    forecastItem.className = 'ForcastDailyinfo';
    forecastItem.id = index + 1;

    // create forecast item content
    forecastItem.innerHTML = `
      <div class="forecast-day">
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" width="50">
        <div class="forecast-details">
          <div class="forecast-date">${dayName}, ${formattedDate}</div>
          <div class="forecast-condition">${day.day.condition.text}</div>
          <div class="forecast-temp">High: ${maxTemp} | Low: ${minTemp}</div>
        </div>
      </div>
    `;

    forecastContainer.appendChild(forecastItem);
  });
}

/**
 * updates the detailed conditions section
 * @param {Object} data - current weather
 */

function updateDetailedConditions(data) {
  const detailsContainer = document.querySelector('.DetailedConditions');

  // clear existing details items (except the heading)
  const heading = detailsContainer.querySelector('.ConditionDetailH1');
  detailsContainer.innerHTML = '';
  detailsContainer.appendChild(heading);

  // create details items
  const details = [
    { label: 'Feels Like', value: getTemperatureUnit() === 'celsius' ? `${data.current.feelslike_c}°C` : `${data.current.feelslike_f}°F` },
    { label: 'Humidity', value: `${data.current.humidity}%` },
    { label: 'Wind', value: `${data.current.wind_mph} mph ${data.current.wind_dir}` },
    { label: 'Pressure', value: `${data.current.pressure_mb} mb` },
    { label: 'Visibility', value: `${data.current.vis_miles} miles` },
    { label: 'UV Index', value: data.current.uv },
    { label: 'Precipitation', value: `${data.current.precip_mm} mm` },
    { label: 'Last Updated', value: new Date(data.current.last_updated).toLocaleTimeString() }
  ];

  details.forEach((detail, index) => {
    const detailItem = document.createElement('li');
    detailItem.className = 'ConditionDetailinfo';
    detailItem.id = index + 1;
    detailItem.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
    detailsContainer.appendChild(detailItem);
  });
}

/**
 * displays an error message
 * @param {string} message - error message
 */
function displayError(message) {
  const errorContainer = document.getElementById('search-error');
  errorContainer.textContent = message;
  errorContainer.classList.add('visible');

  // hide after 5 seconds
  setTimeout(() => {
    errorContainer.classList.remove('visible');
    errorContainer.textContent = '';
  }, 5000);
}