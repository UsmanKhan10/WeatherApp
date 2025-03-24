import React, { useState, useEffect } from 'react';
import './WeatherRecommendation.css';

interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

interface ForecastItem {
  dt: number;
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: WindData;
  visibility: number;
  pop: number;
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface ClothingRecommendations {
  top: string[];
  bottom: string[];
  accessories: string[];
}

const WeatherRecommendation = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('London');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'be272084e4638d9e2995a929638b4ecf';
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Weather data not available');
        }

        const data: WeatherData = await response.json();
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  const getClothingRecommendations = (
    temp: number,
    precipitation: number,
    windSpeed: number
  ): ClothingRecommendations => {
    const recommendations: ClothingRecommendations = {
      top: [],
      bottom: [],
      accessories: []
    };

    // Temperature-based recommendations
    if (temp < 10) {
      recommendations.top.push('Hoodie', 'Thermal layer');
      recommendations.bottom.push('Joggers', 'Waterproof trousers');
      recommendations.accessories.push('Gloves', 'Beanie');
    } else if (temp < 15) {
      recommendations.top.push('Long-sleeve shirt', 'Light jacket');
      recommendations.bottom.push('Hiking pants');
    } else {
      recommendations.top.push('T-shirt', 'Light windbreaker');
      recommendations.bottom.push('Shorts', 'Convertible pants');
    }

    // Precipitation-based recommendations
    if (precipitation > 30) {
      recommendations.top.push('Waterproof jacket');
      recommendations.bottom.push('Waterproof trousers');
      recommendations.accessories.push('Waterproof cover for backpack');
    }

    // Wind-based recommendations
    if (windSpeed > 15) {
      recommendations.top.push('Windbreaker');
      recommendations.accessories.push('Buff or neck gaiter');
    }

    return recommendations;
  };

  if (loading) return <div className="loading">Loading weather data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!weatherData) return <div className="error">No weather data available</div>;

  const hourlyForecast = weatherData.list.slice(0, 5);
  const currentWeather = hourlyForecast[0];
  const recommendations = getClothingRecommendations(
    currentWeather.main.temp,
    currentWeather.pop * 100,
    currentWeather.wind.speed
  );

  return (
    <div className="weather-recommendation-container">
      <h2>Clothing Recommendations</h2>

      <div className="time-slots">
        {hourlyForecast.map((forecast, index) => (
          <div key={index} className="time-slot">
            <div className="time">
              {index === 0 ? 'Now' : `${new Date(forecast.dt * 1000).getHours()}pm`}
            </div>
            <div className="temp">{Math.round(forecast.main.temp)}°C</div>
            <div className="precip">{Math.round(forecast.pop * 100)}%</div>
            <div className="wind">{Math.round(forecast.wind.speed)} mph</div>
          </div>
        ))}
      </div>

      <div className="weather-summary">
        {currentWeather.weather[0].description.charAt(0).toUpperCase() +
         currentWeather.weather[0].description.slice(1)} with {Math.round(currentWeather.pop * 100)}% chance of precipitation
      </div>

      <div className="recommendation-text">
        A {recommendations.top.includes('Hoodie') ? 'hoodie/jacket' : 'light jacket'} with{' '}
        {recommendations.bottom.includes('Joggers') ? 'joggers/waterproof trousers' : 'hiking pants'} are preferred
      </div>

      <div className="clothing-items">
        {[...recommendations.top.slice(0, 2), ...recommendations.bottom.slice(0, 2)].map((item, index) => (
          <div key={`item-${index}`} className="clothing-item">
            {item}
          </div>
        ))}
      </div>

      <div className="location-search">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
        <button onClick={() => setLocation(location)}>Search</button>
      </div>
    </div>
  );
};

export default WeatherRecommendation;