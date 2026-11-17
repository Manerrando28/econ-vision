const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

// Execute the actual TypeScript repository against real SQLite, replacing only
// Expo's native bridge (unavailable in Node). This is not an emulator test.
function loadModules(overrides = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const output = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const localRequire = (id) => {
      if (id in overrides) return overrides[id];
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), `${id}.ts`));
      return require(id);
    };
    const execute = vm.runInNewContext(`(function(require, module, exports) { ${output}\n})`, {
      console, setTimeout, clearTimeout, AbortController, ...globals,
    });
    execute(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}

function sqliteBridge(db) {
  return {
    execAsync: async (sql) => { db.exec(sql); },
    getFirstAsync: async (sql, ...params) => db.prepare(sql).get(...params),
    getAllAsync: async (sql, ...params) => db.prepare(sql).all(...params),
    runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
    closeAsync: async () => db.close(),
    withTransactionAsync: async (operation) => {
      db.exec('BEGIN');
      try { await operation(); db.exec('COMMIT'); }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}

function repository(legacy = null) {
  const db = new DatabaseSync(':memory:');
  const load = loadModules({
    'expo-sqlite': { openDatabaseAsync: async () => sqliteBridge(db) },
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async () => legacy } },
  });
  return { db, api: load('src/storage/reportsDb.ts'), load };
}

const input = {
  location: "Rua Fictícia d'Água, 123; DROP TABLE citizen_reports;",
  neighborhood: 'Bairro de demonstração',
  category: 'ALAGAMENTO',
  severity: 'ATENCAO',
  description: 'Dados fictícios para teste.',
};

test('SQLite: create, read, reopen, resolve and delete with bound SQL parameters', async () => {
  const { db, api } = repository();
  try {
    assert.equal((await api.getReports()).length, 0);
    const reports = await api.addReport(input);
    assert.equal(reports.length, 1);
    assert.equal(reports[0].location, input.location);
    const id = reports[0].id;
    assert.equal((await api.toggleReportResolved(id))[0].resolved, true);
    assert.equal((await api.toggleReportResolved(id))[0].resolved, false);
    assert.equal((await api.getReports())[0].id, id);
    // A new repository instance sees the same persisted database.
    const reopened = loadModules({
      'expo-sqlite': { openDatabaseAsync: async () => sqliteBridge(db) },
      '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async () => null } },
    })('src/storage/reportsDb.ts');
    assert.equal((await reopened.getReports())[0].id, id);
    assert.equal((await api.deleteReport(id)).length, 0);
    assert.equal((await reopened.getReports()).length, 0);
  } finally { db.close(); }
});

test('SQLite: migrate legacy records once, without repopulating deleted records', async () => {
  const old = { ...input, id: 'legacy-1', createdAt: 'Exemplo', resolved: false };
  const { db, api } = repository(JSON.stringify([old]));
  try {
    assert.equal((await api.getReports())[0].location, old.location);
    await api.deleteReport(old.id);
    assert.equal((await api.getReports()).length, 0);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
  } finally { db.close(); }
});

test('SQLite: corrupt legacy data must produce an error, never fake successful reads', async () => {
  const { api } = repository('invalid JSON');
  await assert.rejects(api.getReports());
});

test('SQLite: reject an invalid occurrence before writing', async () => {
  const { db, api } = repository();
  try { await assert.rejects(api.addReport({ ...input, location: ' ' })); }
  finally { db.close(); }
});

function weather(fetch) {
  return loadModules({}, { fetch })('src/services/weatherApi.ts').fetchLocalWeather;
}
test('Weather: public data uses the São Paulo API hour, not the phone timezone', async () => {
  const load = weather(async () => ({
    ok: true,
    json: async () => ({
      current: { temperature_2m: 23.4, precipitation: 0, time: '2026-11-16T03:00' },
      hourly: { precipitation_probability: Array.from({ length: 24 }, (_, hour) => hour === 3 ? 37 : 0) },
    }),
  }));
  const result = await load();
  assert.equal(result.temperature, 23);
  assert.equal(result.rainProbability, 37);
});
test('Weather: network, HTTP and invalid responses must reject instead of inventing readings', async () => {
  await assert.rejects(weather(async () => { throw new Error('offline'); })());
  await assert.rejects(weather(async () => ({ ok: false }))());
  await assert.rejects(weather(async () => ({ ok: true, json: async () => ({ current: {} }) }))());
});

function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sources(file) : /\.tsx?$/.test(file) ? [file] : [];
  });
}
test('Theme: colors, font values and spacing literals are restricted to src/theme', () => {
  const forbidden = /^(fontSize|fontFamily|fontWeight|lineHeight|letterSpacing|padding.*|margin.*|gap|rowGap|columnGap)$/;
  const violations = [];
  for (const file of sources(path.join(root, 'src'))) {
    if (file.includes(`${path.sep}theme${path.sep}`)) continue;
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isPropertyAssignment(node) && forbidden.test(node.name.getText(source))
        && (ts.isNumericLiteral(node.initializer) || ts.isStringLiteral(node.initializer))) {
        violations.push(`${path.relative(root, file)}: ${node.getText(source)}`);
      }
      if (ts.isStringLiteral(node) && /^(#[\da-f]{3,8}|rgba?\()/i.test(node.text)) {
        violations.push(`${path.relative(root, file)}: ${node.text}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  assert.deepEqual(violations, []);
});
