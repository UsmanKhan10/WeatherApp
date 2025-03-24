const openWeatherApiKey = "50748fbd9b68e1e85bf8a0097622aee6";


export async function fetchWeatherByCoordinates(lat: number, lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return await response.json();
}
