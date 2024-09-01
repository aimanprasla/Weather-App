import React, { useState } from 'react';
import './App.css';

const API_KEY = process.env.REACT_APP_WEATHERMAP_API_KEY;

const App = () => {
  const [cityName, setCityName] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if a city has been searched

  const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(' ')[0];
    const temp = ((weatherItem.main.temp - 273.15) * (9/5) + 32).toFixed(2);
    const feelsLike = ((weatherItem.main.feels_like - 273.15) * (9/5) + 32).toFixed(2);

    if (index === 0) { // Current weather card
      return (
        <div key={index} className="current-weather">
          <div className="details">
            <h2>{`${cityName} (${date})`}</h2>
            <h4>{`Temperature: ${temp}°F`}</h4>
            <h4>{`Feels Like: ${feelsLike}°F`}</h4>
            <h4>{`Wind: ${weatherItem.wind.speed} M/S`}</h4>
          </div>
          <div className="icon">
            <img src={`https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png`} alt="weather-icon" />
            <h4>{weatherItem.weather[0].description}</h4>
          </div>
        </div>
      );
    } else { // Forecast weather card
      return (
        <li key={index} className="card">
          <h2>{`(${date})`}</h2>
          <img src={`https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`} alt="weather-icon" />
          <h4>{`Temp: ${temp}°F`}</h4>
          <h4>{`Feels Like: ${feelsLike}°F`}</h4>
          <h4>{`Wind: ${weatherItem.wind.speed} M/S`}</h4>
        </li>
      );
    }
  };

  const getWeather = (cityName, lat, lon) => {
    const WEATHERAPPDETAILS_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const uniqueForecastDays = [];

    fetch(WEATHERAPPDETAILS_API_URL)
      .then(res => res.json())
      .then(data => {
        const fiveDayForecast = data.list.filter(forecast => {
          const forecastDate = new Date(forecast.dt_txt).getDate();
          if (!uniqueForecastDays.includes(forecastDate)) {
            uniqueForecastDays.push(forecastDate);
            return true;
          }
          return false;
        });
        
        setWeatherData(createWeatherCard(cityName, fiveDayForecast[0], 0));
        setForecastData(fiveDayForecast.slice(1).map((item, index) => createWeatherCard(cityName, item, index + 1)));
        setHasSearched(true);
      })
      .catch(() => alert("Error with fetching city weather"));
  };
  

  const getCoords = () => {
    if (!cityName) return;
    const WEATHERAPP_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(WEATHERAPP_API_URL)
      .then(res => res.json())
      .then(data => {
        if (!data.length) return alert(`Could not find ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeather(name, lat, lon);
      })
      .catch(() => alert("Error with fetching entered city"));
  };

  const getUserCoords = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const USER_GEOCODE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        
        fetch(USER_GEOCODE_URL)
          .then(res => res.json())
          .then(data => {
            const { name } = data[0];
            getWeather(name, latitude, longitude);
          })
          .catch(() => alert("Error with fetching user coords"));
      },
      error => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("User denied location access, reset permissions and grant access");
        }
      }
    );
  };

  const togglePopup = () => setPopupVisible(!popupVisible);

  return (
    <div className="App">
      <button className="info-button" onClick={togglePopup}>More Info</button>
      {popupVisible && (
        <div id="popup" className="popup-box">
          <div className="popup-content">
            <span className="close-button" onClick={togglePopup}>&times;</span>
            <h2>Information</h2>
            <p>
              This weather app was made by Aiman Prasla. 
              This was made for the technical assessment for PM Accelerator. 
              The Product Manager Accelerator Program is designed to support PM professionals through every stage of their career. 
              From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.
              Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavours. 
            </p>
          </div>
        </div>
      )}
      <h1>Made By: Aiman Prasla</h1>
      <div className="container">
        <div className="weather-input">
          <h3>Enter a City Name</h3>
          <input
            className="city-input"
            type="text"
            placeholder="E.g. Houston, Austin, Dallas"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && getCoords()}
          />
          <button className="search-button" onClick={getCoords}>Search</button>
          <div className="separator"></div>
          <button className="location-button" onClick={getUserCoords}>Use current location</button>
          <h2>Latest Weather Information</h2>
        </div>
        <div className="weather-data">
          {/* Conditional rendering of dummy or fetched data */}
          {!hasSearched ? (
            <>
              {/* Dummy Data */}
              <div className="current-weather">
                <div className="details">
                  <h2>Houston</h2>
                  <h4>Temperature: 100°F</h4>
                  <h4>Feels Like: 100°F</h4>
                  <h4>Wind: 10 M/S</h4>
                </div>
              </div>
              <div className="days-forecast">
                <h2>4/5-Day Forecast</h2>
                <ul className="weather-cards">
                  {/* Example of dummy data cards */}
                  <li className="card">
                    <h2>Houston</h2>
                    <h4>Temp: 100°F</h4>
                    <h4>Feels Like: 100°F</h4>
                    <h4>Wind: 10 M/S</h4>
                  </li>
                  <li className="card">
                    <h2>Houston</h2>
                    <h4>Temp: 100°F</h4>
                    <h4>Feels Like: 100°F</h4>
                    <h4>Wind: 10 M/S</h4>
                  </li>
                  <li className="card">
                    <h2>Houston</h2>
                    <h4>Temp: 100°F</h4>
                    <h4>Feels Like: 100°F</h4>
                    <h4>Wind: 10 M/S</h4>
                  </li>
                  <li className="card">
                    <h2>Houston</h2>
                    <h4>Temp: 100°F</h4>
                    <h4>Feels Like: 100°F</h4>
                    <h4>Wind: 10 M/S</h4>
                  </li>
                  <li className="card">
                    <h2>Houston</h2>
                    <h4>Temp: 100°F</h4>
                    <h4>Feels Like: 100°F</h4>
                    <h4>Wind: 10 M/S</h4>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Fetched Data */}
              <div className="current-weather">
                {weatherData ? weatherData : <p>No current weather data available</p>}
              </div>
              <div className="days-forecast">
                <h2>4/5-Day Forecast</h2>
                <ul className="weather-cards">
                  {forecastData.length > 0 ? forecastData : <p>No forecast data available</p>}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
