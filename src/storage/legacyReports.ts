import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CitizenReport } from '../types';

// Keep the previous key intact: migration must never erase existing records.
export async function readLegacyReports(): Promise<CitizenReport[]> {
  const raw = await AsyncStorage.getItem('@econ_vision:citizen_reports_v1');
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isReport)) {
    throw new Error('Os registros antigos não puderam ser lidos. Os dados foram preservados.');
  }
  return value;
}

function isReport(value: unknown): value is CitizenReport {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return ['id', 'location', 'neighborhood', 'description', 'createdAt'].every((key) => typeof item[key] === 'string')
    && ['ALAGAMENTO', 'BUEIRO_ENTUPIDO', 'RISCO_DESLIZAMENTO'].includes(String(item.category))
    && ['NORMAL', 'ATENCAO', 'CRITICO'].includes(String(item.severity))
    && typeof item.resolved === 'boolean';
}
