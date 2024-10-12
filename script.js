const apiKey = 'f216c49b84ff16ec867822231d69f8af'; // Replace with your OpenWeatherMap API Key

const waterForm = document.getElementById('water-form');
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city');
const weatherInfo = document.getElementById('weather-info');
const averageWater = document.getElementById('weather-recommendation');
const useLocationButton = document.getElementById('use-location');
const alarmTimeInput = document.getElementById('alarm-time');
const setAlarmButton = document.getElementById('set-alarm');
const setAlarmIntervalButton = document.getElementById('set-alarm-interval');
const alarmIntervalInput = document.getElementById('alarm-interval');
const stopAlarmButton = document.getElementById('stop-alarm'); // Stop Alarm Button
let totalWaterIntake = 0;
let temperature = null; // Variable to store temperature
let alarmTimeout = null;
let intervalId = null;
let alarmStopTimeout = null; // To handle the 1-minute stop for alarm sound

// Load the audio file
const alarmSound = document.getElementById('alarm-sound'); // Get the audio element

// Handle Water Intake Form Submission
waterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const intakeAmount = parseFloat(document.getElementById('intake').value);
  if (isNaN(intakeAmount) || intakeAmount <= 0) return;

  totalWaterIntake += intakeAmount;

  // Clear the input field
  document.getElementById('intake').value = '';

  // Update average water recommendation based on total intake and temperature
  if (temperature !== null) {
    const weatherBasedIntake = (temperature >= 30 ? 3 : 2); // Simple example based on temperature
    const recommendedIntake = weatherBasedIntake * 1000; // Convert liters to ml
    const moreWater = Math.max(recommendedIntake - totalWaterIntake, 0).toFixed(2);
    const glasses = Math.ceil(moreWater / 250); // Calculate number of glasses (250 ml each)
    averageWater.textContent = `You should drink ${moreWater / 1000} L (${glasses} glasses) more water.`;
  }

  // Check if the water intake target is met
  if (totalWaterIntake >= (temperature >= 30 ? 3 : 2) * 1000) {
    alarmSound.pause(); // Stop the alarm sound if the target is met
    alarmSound.currentTime = 0; // Reset the audio to start
    alert('Congratulations! You have met your daily water intake goal.');
  }
});

// Handle Weather Form Submission
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  fetchWeatherData(cityName);
});

// Handle Use Location Button Click
useLocationButton.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherData(null, lat, lon);
    }, (error) => {
      weatherInfo.textContent = 'Unable to retrieve your location.';
    });
  } else {
    weatherInfo.textContent = 'Geolocation is not supported by this browser.';
  }
});

// Weather condition to icon mapping
const weatherIcons = {
  'Thunderstorm': 'stormlightning.png',
  'Drizzle': 'rain.png',
  'Rain': 'rain.png',
  'Snow': 'snow.png',
  'Mist': 'clouds.png',
  'Smoke': 'clouds.png',
  'Haze': 'clouds.png',
  'Dust': 'clouds.png',
  'Fog': 'clouds.png',
  'Sand': 'clouds.png',
  'Ash': 'clouds.png',
  'Squall': 'clouds.png',
  'Tornado': 'storm.png',
  'Clear': 'sun.png',
  'Clouds': 'cloudy.png',
};

function getWeatherIcon(weather) {
  return weatherIcons[weather] || 'weather.png';
}

// Fetch Weather Data Function
function fetchWeatherData(cityName, lat = null, lon = null) {
  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;
  if (cityName) {
    url += `&q=${cityName}`;
  } else if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  } else {
    weatherInfo.textContent = 'Please provide a city name or use your location.';
    return;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        const weather = data.weather[0].main;
        const weatherDescription = data.weather[0].description;
        temperature = data.main.temp;
        const city = data.name;
        const weatherIcon = getWeatherIcon(weather);

        weatherInfo.innerHTML = `Weather in ${city}: <img src="images/${weatherIcon}" alt="${weather}" class="weather-icon"> ${weatherDescription}, ${temperature}°C`;

        // Update average water recommendation based on temperature
        const weatherBasedIntake = (temperature >= 30 ? 3 : 2); // Simple example based on temperature
        const recommendedIntake = weatherBasedIntake * 1000; // Convert liters to ml
        const moreWater = Math.max(recommendedIntake - totalWaterIntake, 0).toFixed(2);
        const glasses = Math.ceil(moreWater / 250); // Calculate number of glasses (250 ml each)
        averageWater.textContent = `You should drink ${moreWater / 1000} L (${glasses} glasses) more water.`;
      } else {
        weatherInfo.textContent = 'City not found or invalid.';
      }
    })
    .catch(() => {
      weatherInfo.textContent = 'Error fetching weather data.';
    });
}

// Handle Alarm Time Form Submission
setAlarmButton.addEventListener('click', () => {
  const alarmTime = alarmTimeInput.value;
  if (!alarmTime) return;

  const [hours, minutes] = alarmTime.split(':').map(Number);
  const now = new Date();
  const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

  if (alarmDate <= now) {
    alarmDate.setDate(alarmDate.getDate() + 1); // Set for the next day if time has already passed
  }

  const timeUntilAlarm = alarmDate - now;
  alarmTimeout = setTimeout(() => {
    alarmSound.play(); // Play alarm sound

    // Automatically stop the alarm sound after 1 minute
    alarmStopTimeout = setTimeout(() => {
      stopAlarm();
    }, 60000); // 1 minute = 60000 milliseconds
  }, timeUntilAlarm);
  alert('Alarm set!');
});

// Handle Alarm Interval Form Submission
setAlarmIntervalButton.addEventListener('click', () => {
  const intervalHours = parseInt(alarmIntervalInput.value, 10);
  if (isNaN(intervalHours) || intervalHours <= 0) return;

  intervalId = setInterval(() => {
    alarmSound.play(); // Play alarm sound

    // Automatically stop the alarm sound after 1 minute
    alarmStopTimeout = setTimeout(() => {
      stopAlarm();
    }, 60000); // 1 minute = 60000 milliseconds
  }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds
  alert('Interval alarm set!');
});

// Handle Stop Alarm Button Click
stopAlarmButton.addEventListener('click', () => {
  stopAlarm();
});

// Function to stop all alarms and reset
function stopAlarm() {
  if (alarmTimeout) {
    clearTimeout(alarmTimeout); // Stop the single alarm
    alarmTimeout = null;
  }
  if (intervalId) {
    clearInterval(intervalId); // Stop the interval alarm
    intervalId = null;
  }
  if (alarmStopTimeout) {
    clearTimeout(alarmStopTimeout); // Stop the auto-stop timeout
    alarmStopTimeout = null;
  }
  alarmSound.pause(); // Stop the alarm sound
  alarmSound.currentTime = 0; // Reset the audio to start
  alert('Alarm stopped!');
}

