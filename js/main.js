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
const locationInput = document.getElementById('location-input');
const errorContainer = document.getElementById('search-error');

// Add event listeners
searchForm.addEventListener('submit', handleSearch);

// Constants
const DEFAULT_LOCATION = "Rexburg, Idaho";
const DAY_START_HOUR = 6;  // 6 AM
const DAY_END_HOUR = 18;   // 6 PM

// Initialize the app
function initializeApp() {
    // Update logo based on time of day
    updateLogoForTimeOfDay();
    
    // Get DOM elements
    searchForm = document.getElementById('searchForm');
    searchInput = document.getElementById('searchInput');
    errorContainer = document.getElementById('search-error');
    favoriteButton = document.getElementById('favorite-button');
    unitToggle = document.getElementById('unit-toggle');
    fahrenheitUnit = document.querySelector('.unit.fahrenheit');
    celsiusUnit = document.querySelector('.unit.celsius');
    recentSearchesContainer = document.getElementById('recentSearches');
    recentSearchesList = document.getElementById('recentSearchesList');
    
    // Set up event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Add logo click handler
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (event) => {
            event.preventDefault();
            const favoriteLocation = getFavoriteLocation() || DEFAULT_LOCATION;
            loadWeatherData(favoriteLocation);
            updateURL(''); // Clear the location parameter from URL
        });
    }
    
    if (unitToggle) {
        // Initialize temperature unit toggle
        const savedUnit = getTemperatureUnit();
        unitToggle.checked = savedUnit === 'celsius';
        updateUnitDisplay(savedUnit);
        
        unitToggle.addEventListener('change', () => {
            const unit = unitToggle.checked ? 'celsius' : 'fahrenheit';
            saveTemperatureUnit(unit);
            updateUnitDisplay(unit);
        });
    }
    
    if (favoriteButton) {
        favoriteButton.addEventListener('click', handleFavoriteClick);
    }
    
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (recentSearchesList?.children.length > 0) {
                recentSearchesContainer?.classList.add('visible');
            }
        });
        
        document.addEventListener('click', (e) => {
            // If click is outside search input and recent searches container
            if (!searchInput.contains(e.target) && !recentSearchesContainer?.contains(e.target)) {
                hideRecentSearches();
            }
        });
    }
    
    // Load initial data
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    
    if (locationParam) {
        loadWeatherData(locationParam);
    } else {
        const favoriteLocation = getFavoriteLocation() || DEFAULT_LOCATION;
        loadWeatherData(favoriteLocation);
    }
    
    // Initialize recent searches
    loadRecentSearches();
}

// Function to update logo based on time of day
function updateLogoForTimeOfDay() {
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= DAY_START_HOUR && currentHour < DAY_END_HOUR;
    const logoPath = isDaytime ? 'assets/logo.png' : 'assets/logo-night.png';
    
    // Update all logo images on the page
    const logoImages = document.querySelectorAll('.logo');
    logoImages.forEach(logo => {
        logo.src = logoPath;
    });
}

// Update logo every minute to handle time changes
setInterval(updateLogoForTimeOfDay, 60000);

// Call initializeApp when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Temperature unit toggle functionality
function updateUnitDisplay(unit) {
    if (fahrenheitUnit && celsiusUnit) {
        if (unit === 'celsius') {
            fahrenheitUnit.style.opacity = '0.5';
            celsiusUnit.style.opacity = '1';
        } else {
            fahrenheitUnit.style.opacity = '1';
            celsiusUnit.style.opacity = '0.5';
        }
    }
    
    // Update all temperature displays
    const currentTemp = document.querySelector('.current-temp');
    const feelsLike = document.getElementById('feels-like');
    const hourlyTemps = document.querySelectorAll('.temperature');
    const forecastTemps = document.querySelectorAll('.forecast-temp');
    
    // Update current temperature
    if (currentTemp) {
        const tempValue = parseInt(currentTemp.textContent);
        const convertedTemp = unit === 'celsius' ? Math.round((tempValue - 32) * 5/9) : Math.round((tempValue * 9/5) + 32);
        currentTemp.textContent = `${convertedTemp}°${unit === 'celsius' ? 'C' : 'F'}`;
    }
    
    // Update feels like temperature
    if (feelsLike) {
        const feelsLikeValue = parseInt(feelsLike.textContent);
        const convertedFeelsLike = unit === 'celsius' ? Math.round((feelsLikeValue - 32) * 5/9) : Math.round((feelsLikeValue * 9/5) + 32);
        feelsLike.textContent = `${convertedFeelsLike}°${unit === 'celsius' ? 'C' : 'F'}`;
    }
    
    // Update hourly temperatures
    hourlyTemps.forEach(temp => {
        const tempValue = parseInt(temp.textContent);
        const convertedTemp = unit === 'celsius' ? Math.round((tempValue - 32) * 5/9) : Math.round((tempValue * 9/5) + 32);
        temp.textContent = `${convertedTemp}°${unit === 'celsius' ? 'C' : 'F'}`;
    });
    
    // Update forecast temperatures
    forecastTemps.forEach(temp => {
        const [high, low] = temp.textContent.split(' / ').map(t => parseInt(t));
        const convertedHigh = unit === 'celsius' ? Math.round((high - 32) * 5/9) : Math.round((high * 9/5) + 32);
        const convertedLow = unit === 'celsius' ? Math.round((low - 32) * 5/9) : Math.round((low * 9/5) + 32);
        temp.textContent = `${convertedHigh}°${unit === 'celsius' ? 'C' : 'F'} / ${convertedLow}°${unit === 'celsius' ? 'C' : 'F'}`;
    });
}

// Favorite location functionality
function setFavoriteLocation(location) {
    localStorage.setItem('favoriteLocation', location);
    if (favoriteButton) {
        favoriteButton.classList.add('active');
    }
}

function removeFavoriteLocation() {
    localStorage.removeItem('favoriteLocation');
    if (favoriteButton) {
        favoriteButton.classList.remove('active');
    }
}

function updateFavoriteButton(location) {
    if (!favoriteButton) return;
    
    const currentFavorite = getFavoriteLocation();
    if (currentFavorite === location) {
        favoriteButton.classList.add('active');
    } else {
        favoriteButton.classList.remove('active');
    }
}

function handleFavoriteClick() {
    const currentLocation = document.querySelector('.location-name')?.textContent;
    if (!currentLocation) return;
    
    if (favoriteButton.classList.contains('active')) {
        removeFavoriteLocation();
    } else {
        setFavoriteLocation(currentLocation);
    }
}

// Search form handling
function handleSearch(event) {
    event.preventDefault();
    const location = searchInput?.value.trim();
    if (location) {
        updateURL(location); // Update URL with location parameter
        loadWeatherData(location);
        searchInput.blur(); // Deselect the search input
        hideRecentSearches(); // Hide the recent searches dropdown
    }
}

/**
 * Updates the URL with the location parameter
 * @param {string} location - The location to search for
 */
function updateURL(location) {
    const url = new URL(window.location);
    url.searchParams.set('location', location);
    window.history.pushState({}, '', url);
}

// Weather data loading and display
async function loadWeatherData(location) {
    try {
        console.log('Loading weather data for:', location);
        showLoading();
        
        // Fetch both current and forecast data
        const [currentData, forecastData] = await Promise.all([
            getCurrentWeather(location),
            getForecast(location, 8) // Request 8 days to ensure we get 7 days after today
        ]);
        
        console.log('Current data:', currentData);
        console.log('Forecast data:', forecastData);
        
        // Combine the data
        const data = {
            location: currentData.location,
            current: currentData.current,
            forecast: forecastData.forecast
        };
        
        updateWeatherDisplay(data);
        updateFavoriteButton(location);
        addToRecentSearches(location); // Add to recent searches
        hideLoading();
    } catch (error) {
        console.error('Error loading weather data:', error);
        hideLoading();
    }
}

function updateWeatherDisplay(data) {
    updateCurrentWeather(data);
    updateHourlyForecast(data);
    updateDailyForecast(data);
}

/**
 * update the UI with current weather and forecast data
 * @param {Object} data - current weather data from API
 * @param {Object} forecastData - forecast data from API
 */
function updateCurrentWeather(data) {
    const locationName = `${data.location.name}, ${data.location.region}`;
    document.querySelector('.location-name').textContent = locationName;
    updateFavoriteButton(locationName);
    
    // Update current temperature
    const currentTemp = Math.round(getTemperatureUnit() === 'celsius' ? data.current.temp_c : data.current.temp_f);
    document.querySelector('.current-temp').textContent = `${currentTemp}°${getTemperatureUnit() === 'celsius' ? 'C' : 'F'}`;
    
    // Update weather icon and condition
    document.querySelector('.weather-icon').src = data.current.condition.icon;
    document.querySelector('.weather-icon').alt = data.current.condition.text;
    document.querySelector('.weather-condition').textContent = data.current.condition.text;
    
    // Update current conditions
    document.getElementById('feels-like').textContent = 
        `${Math.round(getTemperatureUnit() === 'celsius' ? data.current.feelslike_c : data.current.feelslike_f)}°${getTemperatureUnit() === 'celsius' ? 'C' : 'F'}`;
    
    document.getElementById('humidity').textContent = `${data.current.humidity}%`;
    document.getElementById('wind-speed').textContent = 
        `${Math.round(data.current.wind_mph)} ${getTemperatureUnit() === 'celsius' ? 'm/s' : 'mph'}`;
}

/**
 * updates the hourly forecast 
 * @param {Object} data - forecast 
 */
function updateHourlyForecast(data) {
    const hourlyForecastContainer = document.querySelector('.hourly-timeline');
    if (!hourlyForecastContainer) return;

    // Clear existing content
    hourlyForecastContainer.innerHTML = '';

    // Get current time in the location's timezone
    const now = new Date();
    const timezone = data.location.tz_id;

    // Create current hour data from current conditions
    const currentHour = {
        time: now.toISOString(),
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition
    };

    // Filter and get the next 11 hours (since we're adding current hour)
    const next11Hours = data.forecast.forecastday[0].hour
        .filter(hour => {
            const hourTime = new Date(hour.time);
            return hourTime > now;
        })
        .slice(0, 11);

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
    const forecastContainer = document.querySelector('.forecast-cards');
    forecastContainer.innerHTML = '';
    
    // Skip today and tomorrow, take the next 7 days
    const forecastDays = data.forecast.forecastday.slice(2, 9);
    
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const highTemp = Math.round(getTemperatureUnit() === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f);
        const lowTemp = Math.round(getTemperatureUnit() === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f);
        const condition = day.day.condition.text;
        const icon = day.day.condition.icon;
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="${icon}" alt="${condition}" class="forecast-icon">
            <div class="forecast-details">
                <div class="forecast-temp">${highTemp}°${getTemperatureUnit() === 'celsius' ? 'C' : 'F'} / ${lowTemp}°${getTemperatureUnit() === 'celsius' ? 'C' : 'F'}</div>
                <div class="forecast-condition">${condition}</div>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

/**
 * updates the detailed conditions section
 * @param {Object} data - current weather
 */
function updateDetailedConditions(data) {
    const conditionsContainer = document.querySelector('.DetailedConditions');
    conditionsContainer.innerHTML = '<h1 class="ConditionDetailH1">Current Conditions</h1>';
    
    const conditions = [
        { label: 'Humidity', value: `${data.current.humidity}%` },
        { label: 'Wind Speed', value: `${Math.round(data.current.wind_mph)} mph ${data.current.wind_dir}` },
        { label: 'Pressure', value: `${data.current.pressure_mb} mb` },
        { label: 'UV Index', value: Math.round(data.current.uv) },
        { label: 'Visibility', value: `${Math.round(data.current.vis_miles)} miles` },
        { label: 'Cloud Cover', value: `${data.current.cloud}%` }
    ];
    
    conditions.forEach(condition => {
        const conditionItem = document.createElement('div');
        conditionItem.className = 'condition-item';
        conditionItem.innerHTML = `
            <span class="condition-label">${condition.label}:</span>
            <span class="condition-value">${condition.value}</span>
        `;
        conditionsContainer.appendChild(conditionItem);
    });
}

/**
 * displays an error message
 * @param {string} message - error message
 */
function displayError(message) {
    const errorContainer = document.getElementById('search-error');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.add('visible');
        
        // hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.remove('visible');
            errorContainer.textContent = '';
        }, 5000);
    }
}

function showLoading() {
    document.body.classList.add('loading');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoading() {
    document.body.classList.remove('loading');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Recent searches functionality
function loadRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    updateRecentSearchesList(searches);
}

// Update the recent searches list in the DOM
function updateRecentSearchesList(searches) {
    if (!recentSearchesList) return;
    
    recentSearchesList.innerHTML = '';
    if (searches.length === 0) {
        recentSearchesContainer?.classList.remove('visible');
        return;
    }
    
    searches.forEach(search => {
        const li = document.createElement('li');
        li.textContent = search;
        li.addEventListener('click', () => {
            searchInput.value = search;
            updateURL(search);
            loadWeatherData(search);
            hideRecentSearches();
        });
        recentSearchesList.appendChild(li);
    });
}

// Add a search to recent searches
function addToRecentSearches(location) {
    let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    searches = searches.filter(s => s.toLowerCase() !== location.toLowerCase());
    searches.unshift(location);
    searches = searches.slice(0, 5); // Keep only the 5 most recent searches
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    updateRecentSearchesList(searches);
}

// Recent searches visibility functions
function showRecentSearches() {
    if (recentSearchesContainer && recentSearchesList.children.length > 0) {
        recentSearchesContainer.classList.add('visible');
    }
}

function hideRecentSearches() {
    if (recentSearchesContainer) {
        recentSearchesContainer.classList.remove('visible');
    }
}