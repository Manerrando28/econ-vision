import type { CitizenReport } from '../types';
import { getReportsStore } from './reportsStore';

export interface ReportsStore {
  getAll(): Promise<CitizenReport[]>;
  insert(report: CitizenReport): Promise<void>;
  toggle(id: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export async function getReports(): Promise<CitizenReport[]> {
  const reports = await (await getReportsStore()).getAll();
  return reports.sort((a, b) => (Number.parseInt(b.id, 10) || 0) - (Number.parseInt(a.id, 10) || 0));
}

export async function addReport(report: Omit<CitizenReport, 'id' | 'createdAt' | 'resolved'>): Promise<CitizenReport[]> {
  if (!report.location.trim() || !report.neighborhood.trim()) throw new Error('Informe endereço e bairro.');
  const now = new Date();
  const newReport: CitizenReport = {
    ...report,
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    resolved: false,
  };
  await (await getReportsStore()).insert(newReport);
  return getReports();
}

export async function toggleReportResolved(id: string): Promise<CitizenReport[]> {
  await (await getReportsStore()).toggle(id);
  return getReports();
}

export async function deleteReport(id: string): Promise<CitizenReport[]> {
  await (await getReportsStore()).remove(id);
  return getReports();
}
