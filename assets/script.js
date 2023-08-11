const apiKey = '7555ce5a27fe25c1691ed0dfed7dfcd2';
const geoApi = 'https://api.openweathermap.org/geo/1.0/direct';
const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

function fetchCoordinates(cityName) {
    const geoUrl = `${geoApi}?q=${cityName}&limit=1&appid=${apiKey}`;
    
    fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                fetchWeatherData(lat, lon);
            } else {
                console.error('City not found');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
        });
}

// Helper function to generate formatted full date with ordinal suffix
function getFormattedFullDate(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    return `${month} ${day}${suffix}, ${date.getFullYear()}`;
}

function fetchWeatherData(lat, lon) {
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastDateContainer = document.getElementById('forecastDate');
            forecastDateContainer.innerHTML = ''; // Clear previous content

            const forecastContainer = document.getElementById('forecastContainer');
            forecastContainer.innerHTML = ''; // Clear previous content

            let currentDay = '';
            let dayCardsContainer = null;

            data.list.forEach(item => {
                const forecastDate = new Date(item.dt * 1000);
                const day = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
                const formattedFullDate = getFormattedFullDate(forecastDate); // Get the formatted full date

                if (day !== currentDay) {
                    currentDay = day;

                    const dateElement = document.createElement('div');
                    dateElement.classList.add('forecast-day');
                    dateElement.textContent = formattedFullDate; // Use the formatted full date
                    forecastDateContainer.appendChild(dateElement);

                    dayCardsContainer = document.createElement('div');
                    dayCardsContainer.classList.add('forecast-day');
                    forecastContainer.appendChild(dayCardsContainer);
                }

                // Create card for the current forecast item
                const card = createForecastCard(item);
                dayCardsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function createForecastCard(item) {
    // Get the weather condition code
    const weatherConditionCode = item.weather[0].id;

    // Determine the weather icon filename based on the condition code
    const weatherIconFilename = getWeatherIconFilename(weatherConditionCode);

    // Create card elements and structure
    const card = document.createElement('div');
    card.classList.add('forecast-card');

    // Extract hour from timestamp
    const forecastDate = new Date(item.dt * 1000);
    const hour = forecastDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    // Convert temperature from Kelvin to Fahrenheit
    const temperatureKelvin = item.main.temp;
    const temperatureFahrenheit = (temperatureKelvin - 273.15) * 9/5 + 32;

    // Capitalize the first letter of the weather description
    const weatherDescription = item.weather[0].description;
    const capitalizedWeatherDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);

    // Create an image element for the weather icon
    const weatherIconElement = document.createElement('img');
    weatherIconElement.src = `https://openweathermap.org/img/wn/${weatherIconFilename}`;
    weatherIconElement.alt = 'Weather Icon';

    // Create card content using extracted data
    const cardContent = `
        <h3>${hour}</h3>
        <p>${temperatureFahrenheit.toFixed(2)}°F</p>
        <p>${capitalizedWeatherDescription}</p>`;
    
    card.innerHTML = cardContent;
    card.appendChild(weatherIconElement);

    return card;
}

function getWeatherIconFilename(conditionCode) {
    // Define a mapping of condition codes to weather icon filenames
    const iconMappings = {
        // Thunderstorm
        200: '11d.png', // Thunderstorm with light rain
        201: '11d.png', // Thunderstorm with rain
        202: '11d.png', // Thunderstorm with heavy rain
        // ... other mappings for thunderstorm ...

        // Drizzle
        300: '09d.png', // Light intensity drizzle
        301: '09d.png', // Drizzle
        302: '09d.png', // Heavy intensity drizzle
        // ... other mappings for drizzle ...

        // Rain
        500: '10d.png', // Light rain
        501: '10d.png', // Moderate rain
        502: '10d.png', // Heavy intensity rain
        // ... other mappings for rain ...

        // Snow
        600: '13d.png', // Light snow
        601: '13d.png', // Snow
        602: '13d.png', // Heavy snow
        // ... other mappings for snow ...

        // Clear sky
        800: '01d.png', // Clear sky

        // Clouds
        801: '02d.png', // Few clouds
        802: '03d.png', // Scattered clouds
        803: '04d.png', // Broken clouds
        804: '04d.png', // Overcast clouds
    };

    // Return the corresponding weather icon filename, or a default filename if not found
    return iconMappings[conditionCode] || '01d.png'; // You can set a default icon here
}

// Get DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

// Add event listener to search button
searchBtn.addEventListener('click', () => {
    const cityName = cityInput.value;
    fetchCoordinates(cityName);
    // Call function to make API request
    // Process the API response and update forecastContainer
    // Update localStorage with the last searched city
});

// Check if there's a last searched city in localStorage
// If yes, fetch its weather forecast and display on page load

// Function to update localStorage with the last searched city