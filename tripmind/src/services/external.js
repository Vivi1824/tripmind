export async function getWeatherByCity(city) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return {
    temperature: data.main?.temp ?? null,
    condition: data.weather?.[0]?.description ?? "Clear",
  };
}
