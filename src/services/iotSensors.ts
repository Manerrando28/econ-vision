import { FloodSensor } from '../types';

const INITIAL_SENSORS: FloodSensor[] = [
  {
    id: 'ESP32-01',
    name: 'Córrego Anhangabaú - Trecho Baixo',
    neighborhood: 'Centro / República',
    waterLevelCm: 145,
    maxCapacityCm: 160,
    status: 'CRITICO',
    lastUpdated: 'Agora mesmo',
    safeRouteTip: 'Evite o Vale do Anhangabaú. Utilize a Av. Paulista ou Av. Rebouças.',
  },
  {
    id: 'ESP32-02',
    name: 'Av. 23 de Maio - Viaduto Tutóia',
    neighborhood: 'Vila Mariana',
    waterLevelCm: 88,
    maxCapacityCm: 150,
    status: 'ATENCAO',
    lastUpdated: 'Há 2 min',
    safeRouteTip: 'Trânsito lento na pista local. Prefira vias elevadas da região.',
  },
  {
    id: 'ESP32-03',
    name: 'Rua Vergueiro - Estação Paraíso',
    neighborhood: 'Paraíso',
    waterLevelCm: 25,
    maxCapacityCm: 120,
    status: 'NORMAL',
    lastUpdated: 'Há 1 min',
    safeRouteTip: 'Escoamento normal. Via livre para pedestres e veículos.',
  },
  {
    id: 'ESP32-04',
    name: 'Marginal Tietê - Ponte das Bandeiras',
    neighborhood: 'Santana / Centro',
    waterLevelCm: 132,
    maxCapacityCm: 150,
    status: 'CRITICO',
    lastUpdated: 'Agora mesmo',
    safeRouteTip: 'Acúmulo severo na pista expressa. Utilize a Av. Braz Leme.',
  },
];

export async function fetchIoTSensors(): Promise<FloodSensor[]> {
  // Simula latência real de rede IoT (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));
  return INITIAL_SENSORS;
}