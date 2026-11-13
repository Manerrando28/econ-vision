export type RiskLevel = 'NORMAL' | 'ATENCAO' | 'CRITICO';

export interface WeatherData {
  temperature: number;
  precipitation: number; // mm na hora atual
  rainProbability: number; // % nas próximas horas
  conditionText: string;
  isRaining: boolean;
}

export interface FloodSensor {
  id: string;
  name: string;
  neighborhood: string;
  waterLevelCm: number;
  maxCapacityCm: number;
  status: RiskLevel;
  lastUpdated: string;
  safeRouteTip: string;
}

export interface CitizenReport {
  id: string;
  location: string;
  neighborhood: string;
  category: 'ALAGAMENTO' | 'BUEIRO_ENTUPIDO' | 'RISCO_DESLIZAMENTO';
  severity: RiskLevel;
  description: string;
  createdAt: string;
  resolved: boolean;
}