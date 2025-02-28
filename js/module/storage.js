// Favorite Location

/**
 * saves users favorite location to localStorage
 * @param {string} location
 */
export function saveFavoriteLocation(location) {
    localStorage.setItem('favoriteLocation', location);
}

/**
 * gets users favorite location from localStorage
 * @returns {string|null}
 */
export function getFavoriteLocation() {
    return localStorage.getItem('favoriteLocation');
}

// Favorite Unit

/**
 * saves users temperature unit preference
 * @param {string} unit ('celsius' or 'fahrenheit')
 */
export function saveTemperatureUnit(unit) {
    localStorage.setItem('temperatureUnit', unit);
}

/**
 * gets users temperature unit preference
 * @returns {string} 
 */
export function getTemperatureUnit() {
    return localStorage.getItem('temperatureUnit') || 'fahrenheit';
}