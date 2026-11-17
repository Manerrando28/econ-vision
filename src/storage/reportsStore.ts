import { openDatabaseAsync } from 'expo-sqlite';
import type { CitizenReport } from '../types';
import type { ReportsStore } from './reportsDb';
import { readLegacyReports } from './legacyReports';

type ReportRow = Omit<CitizenReport, 'resolved'> & { resolved: number };
const INSERT = `INSERT INTO citizen_reports
  (id, location, neighborhood, category, severity, description, createdAt, resolved)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
let storePromise: Promise<ReportsStore> | undefined;

export function getReportsStore(): Promise<ReportsStore> {
  if (!storePromise) {
    storePromise = openStore().catch((error: unknown) => {
      storePromise = undefined;
      throw error;
    });
  }
  return storePromise;
}

async function openStore(): Promise<ReportsStore> {
  const db = await openDatabaseAsync('eco-vision.db');
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    if ((version?.user_version ?? 0) < 1) {
      const previous = await readLegacyReports();
      await db.withTransactionAsync(async () => {
        await db.execAsync(`CREATE TABLE IF NOT EXISTS citizen_reports (
          id TEXT PRIMARY KEY NOT NULL,
          location TEXT NOT NULL,
          neighborhood TEXT NOT NULL,
          category TEXT NOT NULL CHECK(category IN ('ALAGAMENTO','BUEIRO_ENTUPIDO','RISCO_DESLIZAMENTO')),
          severity TEXT NOT NULL CHECK(severity IN ('NORMAL','ATENCAO','CRITICO')),
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN (0,1))
        );`);
        for (const item of previous) {
          await db.runAsync(INSERT, item.id, item.location, item.neighborhood, item.category, item.severity, item.description, item.createdAt, Number(item.resolved));
        }
        await db.execAsync('PRAGMA user_version = 1;');
      });
    }
  } catch (error) {
    await db.closeAsync();
    throw error;
  }

  return {
    async getAll() {
      const rows = await db.getAllAsync<ReportRow>('SELECT * FROM citizen_reports ORDER BY rowid DESC');
      return rows.map((row) => ({ ...row, resolved: row.resolved === 1 }));
    },
    async insert(item) {
      await db.runAsync(INSERT, item.id, item.location, item.neighborhood, item.category, item.severity, item.description, item.createdAt, Number(item.resolved));
    },
    async toggle(id) {
      await db.runAsync('UPDATE citizen_reports SET resolved = 1 - resolved WHERE id = ?', id);
    },
    async remove(id) {
      await db.runAsync('DELETE FROM citizen_reports WHERE id = ?', id);
    },
  };
}
