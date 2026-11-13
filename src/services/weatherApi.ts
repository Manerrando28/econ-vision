import { WeatherData } from '../types';

// Coordenadas padrão: São Paulo - SP (Região Paulista / Centro)
const DEFAULT_LAT = -23.5614;
const DEFAULT_LON = -46.6559;

export async function fetchLocalWeather(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,rain&hourly=precipitation_probability&forecast_days=1&timezone=America%2FSao_Paulo`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Falha ao buscar dados meteorológicos');
    }

    const data = await response.json();
    const current = data.current;
    const currentHour = new Date().getHours();
    const rainProb = data.hourly?.precipitation_probability?.[currentHour] ?? 0;
    const precipitation = current?.precipitation ?? 0;

    let conditionText = 'Tempo estável e sem chuva';
    if (precipitation > 5 || rainProb >= 75) {
      conditionText = 'Alerta de chuva forte na região';
    } else if (precipitation > 0 || rainProb >= 40) {
      conditionText = 'Chuva leve a moderada prevista';
    }

    return {
      temperature: Math.round(current?.temperature_2m ?? 22),
      precipitation,
      rainProbability: rainProb,
      conditionText,
      isRaining: precipitation > 0,
    };
  } catch (error) {
    console.warn('Usando fallback offline de clima:', error);
    return {
      temperature: 21,
      precipitation: 2.4,
      rainProbability: 65,
      conditionText: 'Modo Offline: Atenção para pancadas de chuva',
      isRaining: true,
    };
  }
}