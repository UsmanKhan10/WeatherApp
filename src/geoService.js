// src/geoService.js
const openCageApiKey = '1870ba34b96e4bbfb07aee57bb80f783';

export async function getCoordinatesFromCity(city) {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${openCageApiKey}`
    );
    const data = await response.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      console.log(`Coordinates for ${city}:`, lat, lng);
      return { lat, lng };
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('OpenCage Error:', error);
    throw error;
  }
}
