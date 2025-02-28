import { getCurrentWeather, getForecast } from './modules/api.js';
import { 
  getFavoriteLocation, 
  saveFavoriteLocation, getTemperatureUnit } from './modules/storage.js';

// search form
const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', handleSearch);

const urlParams = new URLSearchParams(window.location.search);
const locationParam = urlParams.get('location');

if (locationParam) {
  // checks if the URL contains the location
  loadWeatherData(locationParam);
} else {
  // uses the location from localStorage
  const favoriteLocation = getFavoriteLocation();
  
  if (favoriteLocation) {
    loadWeatherData(favoriteLocation);
    updateURL(favoriteLocation);
  } else {
    // default location
    loadWeatherData("Rexburg, Idaho");
    updateURL("Rexburg, Idaho");
  }
}

/**
 * search form submission
 * @param {Event} event
 */
function handleSearch(event) {
  event.preventDefault();
  
  const locationInput = document.getElementById('location-input');
  const location = locationInput.value.trim();
  
  if (location) {
    loadWeatherData(location);
    updateURL(location);
  }
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