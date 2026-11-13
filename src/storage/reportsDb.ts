import AsyncStorage from '@react-native-async-storage/async-storage';
import { CitizenReport } from '../types';

const STORAGE_KEY = '@econ_vision:citizen_reports_v1';

const SEED_REPORTS: CitizenReport[] = [
  {
    id: 'seed-1',
    location: 'Av. Paulista, altura do nº 1106',
    neighborhood: 'Bela Vista',
    category: 'BUEIRO_ENTUPIDO',
    severity: 'ATENCAO',
    description: 'Boca de lobo obstruída por folhas e lixo acumulando água na faixa de pedestres.',
    createdAt: 'Hoje, 18:40',
    resolved: false,
  },
  {
    id: 'seed-2',
    location: 'Praça da Sé - Acesso Metrô',
    neighborhood: 'Sé',
    category: 'ALAGAMENTO',
    severity: 'CRITICO',
    description: 'Lâmina de água cobrindo a calçada, dificultando passagem de idosos e cadeirantes.',
    createdAt: 'Hoje, 19:15',
    resolved: false,
  },
];

export async function getReports(): Promise<CitizenReport[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REPORTS));
      return SEED_REPORTS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao ler reportes:', error);
    return SEED_REPORTS;
  }
}

export async function addReport(
  report: Omit<CitizenReport, 'id' | 'createdAt' | 'resolved'>
): Promise<CitizenReport[]> {
  const current = await getReports();
  const now = new Date();
  const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const newReport: CitizenReport = {
    ...report,
    id: Date.now().toString(),
    createdAt: timeStr,
    resolved: false,
  };

  const updated = [newReport, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function toggleReportResolved(id: string): Promise<CitizenReport[]> {
  const current = await getReports();
  const updated = current.map((item) =>
    item.id === id ? { ...item, resolved: !item.resolved } : item
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteReport(id: string): Promise<CitizenReport[]> {
  const current = await getReports();
  const updated = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}