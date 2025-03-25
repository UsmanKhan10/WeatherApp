import React, { useState, useEffect } from 'react';
import './WeatherRecommendation.css';

// Import Images
import hoodieImg from '../../assets/clothing/hoodie.png';
import joggersImg from '../../assets/clothing/joggers.png';
import windbreakerImg from '../../assets/clothing/windbreaker.png';
import waterproofTrousersImg from '../../assets/clothing/waterprooftrousers.png';
import capImg from '../../assets/clothing/cap.png';
import shoesImg from '../../assets/clothing/shoes.png';
import shortsImg from '../../assets/clothing/shorts.png';
import summersocksImg from '../../assets/clothing/summersocks.png';
import thickjacketImg from '../../assets/clothing/thick-jacket.png';
import thicksocksImg from '../../assets/clothing/thick-socks.png';
import tshirtImg from '../../assets/clothing/tshirt.png';
import thicktrousers from '../../assets/clothing/thick trousers.png';
import RainIcon from '../../assets/icons/Rain.svg';
import SunIcon from '../../assets/icons/Sun.svg';
import WindIcon from '../../assets/icons/Wind.svg';

// Image mapping
const clothingImages: Record<string, string> = {
  'Hoodie': hoodieImg,
  'Joggers': joggersImg,
  'Windbreaker': windbreakerImg,
  'Waterproof Trousers': waterproofTrousersImg,
  'Cap': capImg,
  'Shoes': shoesImg,
  'Shorts': shortsImg,
  'Summer Socks': summersocksImg,
  'Thick Jacket': thickjacketImg,
  'Thick Socks': thicksocksImg,
  'Tshirt': tshirtImg,
  'Thick Trousers': thicktrousers
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
  footwear: string[];
}



const WeatherRecommendation = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('London'); // Tracks input field
  const [location, setLocation] = useState('London');     // Tracks API searches

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {

        console.log("Attempting to fetch weather for:", location);

        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!API_KEY) throw new Error("API key missing - check .env file");

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`
        );

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Weather data not available');
        }

        const data = await response.json();
        console.log("API Data Received:", data); // Debug log
        setWeatherData(data);

      } catch (err) {
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
      accessories: [],
      footwear: [],
    };

    // Temperature conditions
    if (temp < 0) {
      recommendations.top.push('Thick Jacket', 'Hoodie');
      recommendations.bottom.push('Thick Trousers');
      recommendations.footwear.push('Shoes', 'Thick Socks');
    }
    else if (temp < 10) {
      recommendations.top.push('Hoodie', 'Windbreaker');
      recommendations.bottom.push('Joggers');
      recommendations.footwear.push('Shoes')
    }
    else if (temp < 15) {
      recommendations.top.push('Windbreaker', 'Tshirt');
      recommendations.bottom.push('Joggers');
      recommendations.footwear.push('Shoes');

    }
    else {
      recommendations.top.push('Tshirt');
      recommendations.bottom.push('Shorts');
      recommendations.accessories.push('Summer Socks', 'Cap');
    }

    // Precipitation conditions
    if (precipitation > 30) {
      recommendations.top.push('Windbreaker');
      recommendations.accessories.push('Waterproof Trousers');
    }

    // Wind conditions
    if (windSpeed > 15) {
      recommendations.top.push('Windbreaker');
      recommendations.bottom.push('joggers')
    }

    const getRecommendation = () => {
      const current = hourlyForecast[0]; // Same as currentWeather
      const temp = current.main.temp;
      const precipitation = current.pop * 100;
      const windSpeed = current.wind.speed;

      const topItems = recommendations.top.join(" or ");
      const bottomItems = recommendations.bottom.join(" or ");

      let reason = "";
      if (temp < 10) reason = "because it's cold";
      if (precipitation > 30) reason = "because it will rain";
      if (windSpeed > 15) reason = "because it's windy";

      return `Wear ${topItems} with ${bottomItems} ${reason}`;
    };



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
              {index === 0 ? 'Now' : new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
            </div>

            <div className="temp-container">
              <img src={SunIcon} alt="Temperature" className="weather-icon" />
              <span className="temp">{Math.round(forecast.main.temp)}°C</span>
            </div>

            <div className="precip-container">
              <img src={RainIcon} alt="Precipitation" className="weather-icon" />
              <span className="precip">{Math.round(forecast.pop * 100)}%</span>
            </div>

            <div className="wind-container">
              <img src={WindIcon} alt="Wind" className="weather-icon" />
              <span className="wind">{Math.round(forecast.wind.speed)} mph</span>
            </div>
          </div>
        ))}
      </div>

      <div className="weather-summary">
        {currentWeather.weather[0].description} with {Math.round(currentWeather.pop * 100)}% precipitation chance
      </div>

      <div className="recommendation-text">
        {(() => {
          const current = hourlyForecast[0];
          if (!current) return "Loading...";

          const temp = current.main.temp;
          const precip = current.pop * 100;
          const wind = current.wind.speed;

          let text = `Wearing a ${recommendations.top.join(" and/or ")} with ${recommendations.bottom.join(" or ")} is recommended`;

          if (temp < 0) text += " due to extremely low temperatures"
          else if (temp < 10) text += " due to low temperatures";
          if (precip > 30) text += " due to precipitation";
          if (wind > 15) text += " due to high wind speeds";

          return text;
        })()}
      </div>

      <div className="clothing-sections">
        {/* Top/Bottom */}
        <div className="clothing-grid">
          <h4 className="category-title">Tops & Bottoms</h4>
          {[...recommendations.top, ...recommendations.bottom]
            .map(renderClothingItem)}
        </div>

        {/* Footwear */}
        {recommendations.footwear.length > 0 && (
          <div className="clothing-grid">
            <h4 className="category-title">Footwear</h4>
            {recommendations.footwear.map(renderClothingItem)}
          </div>
        )}

        {/* Accessories */}
        {recommendations.accessories.length > 0 && (
          <div className="clothing-grid">
            <h4 className="category-title">Accessories</h4>
            {recommendations.accessories.map(renderClothingItem)}
          </div>
        )}
      </div>

      <div className="location-search">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter location"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              setLocation(inputValue.trim());
            }
          }}
        />
        <button
          onClick={() => {
            if (inputValue.trim()) {
              setLocation(inputValue.trim());
            }
          }}
          disabled={!inputValue.trim()}
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default WeatherRecommendation;