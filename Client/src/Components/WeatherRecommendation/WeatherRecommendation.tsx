import React, { useState, useEffect } from 'react';
import './WeatherRecommendation.css';

// Clothing Images (import all your image files)
// Use relative paths from the component's location
import hoodieImg from '../../assets/clothing/hoodie.png';
import joggersImg from '../../assets/clothing/joggers.png';
import windbreakerImg from '../../assets/clothing/windbreaker.png';
import waterproofTrousersImg from '../../assets/clothing/waterprooftrousers.png';

// Image mapping
const clothingImages: Record<string, string> = {
  'Hoodie': hoodieImg,
  'Joggers': joggersImg,
  'Windbreaker': windbreakerImg,
  'Waterproof Trousers': waterproofTrousersImg,
};

// TypeScript Interfaces
interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
}

interface Weather {
  description: string;
  main: string;
}

interface ForecastItem {
  dt: number;
  main: MainWeatherData;
  weather: Weather[];
  pop: number;
  wind: {
    speed: number;
  };
}

interface WeatherData {
  list: ForecastItem[];
  city: {
    name: string;
  };
}

interface ClothingRecommendations {
  top: string[];
  bottom: string[];
  accessories: string[];
}



const WeatherRecommendation = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('London');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Add this debug log (LINE ~35)
        console.log("Attempting to fetch weather for:", location);

        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!API_KEY) throw new Error("API key missing - check .env file");

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`
        );

        // Add this status check (LINE ~43)
        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Weather data not available');
        }

        const data = await response.json();
        console.log("API Data Received:", data); // Debug log
        setWeatherData(data);

      } catch (err) {
        // Enhanced error logging (LINE ~53)
        console.error("Full Error Details:", {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          time: new Date().toISOString()
        });
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
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

    // Temperature logic
    if (temp < 10) {
      recommendations.top.push('Hoodie', 'Windbreaker');
      recommendations.bottom.push('Joggers', 'Waterproof Trousers');
    } else if (temp < 15) {
      recommendations.top.push('Windbreaker');
      recommendations.bottom.push('Joggers');
    } else {
      recommendations.top.push('Windbreaker');
      recommendations.bottom.push('Joggers');
    }

    // Precipitation logic
    if (precipitation > 30) {
      recommendations.top.push('Waterproof Trousers');
      recommendations.accessories.push('Waterproof Trousers');
    }

    // Wind logic
    if (windSpeed > 15) {
      recommendations.top.push('Windbreaker');
    }

    return recommendations;
  };

  const renderClothingItem = (item: string) => (
    <div key={item} className="clothing-item">
      <img
        src={clothingImages[item]}
        alt={item}
        className="clothing-image"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <span className="clothing-label">{item}</span>
    </div>
  );

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
        {currentWeather.weather[0].description} with {Math.round(currentWeather.pop * 100)}% precipitation chance
      </div>

      <div className="recommendation-text">
        {recommendations.top.includes('Hoodie')
          ? 'A hoodie/jacket with joggers/waterproof trousers are preferred'
          : 'A light jacket with hiking pants are recommended'}
      </div>

      <div className="clothing-grid">
        {[...recommendations.top.slice(0, 2), ...recommendations.bottom.slice(0, 2)]
          .map(renderClothingItem)}
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