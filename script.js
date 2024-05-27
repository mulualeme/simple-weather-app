$(document).ready(function() {
    const apiKey = '50c2acd53349fabd54f52b93c8650d37'; // Replace with your OpenWeatherMap API key
    let cityTimeZone = null;

    function updateTime() {
        if (!cityTimeZone) return;
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: cityTimeZone }));
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-US', options);
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        $('.date').text(`${formattedDate} | ${formattedTime}`);

        const hour = now.getHours();
        if (hour >= 18 || hour < 6) {
            $('body').addClass('dark-mode');
        } else {
            $('body').removeClass('dark-mode');
        }
    }

    function getWeatherIcon(iconCode) {
        return `icons/${iconCode}.svg`;
    }

    function displayWeather(data) {
        const { main, weather, wind, name, timezone } = data;
        const iconUrl = getWeatherIcon(weather[0].icon);
        $('.city-name').text(name);
        $('.temperature').text(`${Math.round(main.temp)}°C`);
        $('.weather-description').text(weather[0].description);
        $('.weather-icon').attr('src', iconUrl);
        $('.humidity p').text(`Humidity: ${main.humidity}%`);
        $('.wind p').text(`Wind: ${Math.round(wind.speed)} km/h`);
        $('.feels-like p').text(`Feels like: ${Math.round(main.feels_like)}°C`);
        cityTimeZone = `Etc/GMT${timezone / 3600 >= 0 ? "-" : "+"}${Math.abs(timezone / 3600)}`;
        updateTime();
    }

    function displayForecast(data) {
        let forecastHtml = '';
        let daysDisplayed = 0;
        data.list.forEach((item, index) => {
            if (index % 8 === 0 && daysDisplayed < 4) {
                const date = new Date(item.dt * 1000);
                const iconUrl = getWeatherIcon(item.weather[0].icon);
                const maxTemp = Math.round(item.main.temp_max);
                const minTemp = Math.round(item.main.temp_min);
                const tempDisplay = maxTemp === minTemp ? `${maxTemp}°` : `${maxTemp}° - ${minTemp}°`;
                forecastHtml += `
                    <div class="daily">
                        <p class="day">${date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                        <img src="${iconUrl}" alt="Weather Icon">
                        <p class="range">${tempDisplay}</p>
                        <p class="description">${item.weather[0].description}</p>
                    </div>
                `;
                daysDisplayed++;
            }
        });
        $('.weather-forecast').html(forecastHtml);
    }

    function fetchWeather(city) {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .done(function(data) {
                displayWeather(data);
            })
            .fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
                // You can display an error message to the user here
            });

        $.getJSON(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
            .done(function(data) {
                displayForecast(data);
            })
            .fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
                // You can display an error message to the user here
            });
    }

    function fetchWeatherByLocation(lat, lon) {
        $.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .done(function(data) {
                displayWeather(data);
            })
            .fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
                // You can display an error message to the user here
            });

        $.getJSON(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
            .done(function(data) {
                displayForecast(data);
            })
            .fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.log("Request Failed: " + err);
                // You can display an error message to the user here
            });
    }

    $('#search-button').click(function() {
        const city = $('#text-box').val().trim();
        if (city) {
            fetchWeather(city);
        } else {
            // Display an error message or handle the empty input case
        }
    });

    $('#text-box').keypress(function(event) {
        if (event.which == 13) {
            const city = $('#text-box').val().trim();
            if (city) {
                fetchWeather(city);
            } else {
                // Display an error message or handle the empty input case
            }
        }
    });

    $('#location-button').click(function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const { latitude, longitude } = position.coords;
                fetchWeatherByLocation(latitude, longitude);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    // Initial weather fetch for New York
    fetchWeather('New York');
    setInterval(updateTime, 1000);
});
