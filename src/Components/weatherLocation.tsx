import { useState } from "react";
import { getCoordinatesFromCity } from "../geoService";
import { fetchWeatherByCoordinates } from "../weatherService";

export default function WeatherFeature() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const fetchWeather = async () => {
    try {
      setError("");
      const coords = await getCoordinatesFromCity(city);
      const weather = await fetchWeatherByCoordinates(coords.lat, coords.lng);
      setWeatherData(weather);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather.");
    }
  };

  return (
    <div className="weather-container">
      {weatherData && (
        <div className="weather-card">
          <div className="weather-icon-temp">
            <img
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt="Weather Icon"
            />
            <div className="temp">{Math.round(weatherData.main.temp)}°C</div>
          </div>
          <div className="weather-details">
            <div>{weatherData.weather[0].description}</div>
            <div>Feels like {Math.round(weatherData.main.feels_like)}°C</div>
            <div>📍 {weatherData.name}</div>
          </div>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          placeholder="Enter a city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search Location</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
