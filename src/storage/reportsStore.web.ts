import type { CitizenReport } from '../types';
import type { ReportsStore } from './reportsDb';
import { readLegacyReports } from './legacyReports';

// The browser preview uses its local database. Phones use reportsStore.ts (SQLite).
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

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error ?? new Error('Não foi possível acessar o banco local.'));
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('A gravação não foi concluída.'));
    tx.onerror = () => reject(tx.error ?? new Error('Falha no banco local.'));
  });
}

async function openStore(): Promise<ReportsStore> {
  const opening = indexedDB.open('eco-vision', 1);
  opening.onupgradeneeded = () => {
    opening.result.createObjectStore('reports', { keyPath: 'id' });
    opening.result.createObjectStore('metadata');
  };
  const db = await request(opening);
  try {
    const migrated = await request(db.transaction('metadata').objectStore('metadata').get('legacyMigration'));
    if (!migrated) {
      const previous = await readLegacyReports();
      const tx = db.transaction(['reports', 'metadata'], 'readwrite');
      const done = transactionDone(tx);
      previous.forEach((item) => tx.objectStore('reports').put(item));
      tx.objectStore('metadata').put(true, 'legacyMigration');
      await done;
    }
  } catch (error) {
    db.close();
    throw error;
  }
  return {
    async getAll() {
      return request<CitizenReport[]>(db.transaction('reports').objectStore('reports').getAll());
    },
    async insert(item) {
      const tx = db.transaction('reports', 'readwrite');
      const done = transactionDone(tx);
      tx.objectStore('reports').add(item);
      await done;
    },
    async toggle(id) {
      const tx = db.transaction('reports', 'readwrite');
      const done = transactionDone(tx);
      const store = tx.objectStore('reports');
      const query = store.get(id);
      query.onsuccess = () => {
        const item = query.result as CitizenReport | undefined;
        if (item) store.put({ ...item, resolved: !item.resolved });
      };
      await done;
    },
    async remove(id) {
      const tx = db.transaction('reports', 'readwrite');
      const done = transactionDone(tx);
      tx.objectStore('reports').delete(id);
      await done;
    },
  };
}
