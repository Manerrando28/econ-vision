import type { WeatherData } from '../types';

// Public, fixed coordinates: no citizen location or personal data is collected.
export async function fetchLocalWeather(): Promise<WeatherData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-23.5614&longitude=-46.6559&current=temperature_2m,precipitation,rain&hourly=precipitation_probability&forecast_days=1&timezone=America%2FSao_Paulo',
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error('O serviço de meteorologia está indisponível.');
    const data = await response.json();
    const temperature: unknown = data.current?.temperature_2m;
    const precipitation: unknown = data.current?.precipitation;
    const time: unknown = data.current?.time;
    const hour = typeof time === 'string' ? Number(time.slice(11, 13)) : NaN;
    const rainProbability: unknown = data.hourly?.precipitation_probability?.[hour];
    if (typeof temperature !== 'number' || !Number.isFinite(temperature)
      || typeof precipitation !== 'number' || !Number.isFinite(precipitation) || precipitation < 0
      || typeof rainProbability !== 'number' || !Number.isFinite(rainProbability) || rainProbability < 0 || rainProbability > 100) {
      throw new Error('O serviço retornou uma previsão incompleta.');
    }
    const conditionText = precipitation > 5 || rainProbability >= 75
      ? 'Possibilidade de chuva forte na região'
      : precipitation > 0 || rainProbability >= 40
        ? 'Chuva leve a moderada prevista'
        : 'Tempo estável e sem chuva';
    return { temperature: Math.round(temperature), precipitation, rainProbability, conditionText, isRaining: precipitation > 0 };
  } finally {
    clearTimeout(timeout);
  }
}
