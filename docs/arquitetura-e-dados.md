# Arquitetura, serviços e banco de dados

## Estrutura do código

```text
src/
  app/
    _layout.tsx           Stack raiz, carregamento da fonte SpaceMono e metadados
    +html.tsx             Documento HTML da versão web (idioma pt-BR e fundo escuro)
    +not-found.tsx        Tela para rotas inexistentes
    modal.tsx             Tela Sobre o Eco Vision
    (tabs)/
      _layout.tsx         Abas inferiores: Radar, Sensores, Reportar e SOS
      index.tsx           Radar urbano
      sensors.tsx         Sensores simulados, busca e filtros
      report.tsx          Formulário e histórico local de ocorrências
      sos.tsx             Contatos de emergência e cuidados
  components/
    AppHeader.tsx         Cabeçalho com marca e acesso à tela Sobre
    LoadError.tsx         Aviso de erro com botão de nova tentativa
    RiskBadge.tsx         Selo com ícone, cor e texto do nível de risco
    Screen.tsx            Container com rolagem, largura máxima e ajuste de teclado
    SensorCard.tsx        Cartão resumido ou detalhado de sensor
  hooks/
    useAsyncResource.ts   Controle de carregamento, erro, recarga e descarte de respostas antigas
  services/
    iotSensors.ts         Mock dos sensores ESP32
    weatherApi.ts         Cliente HTTP da API Open-Meteo
  storage/
    legacyReports.ts      Leitura e validação de registros antigos do AsyncStorage
    reportsDb.ts          Operações de domínio para ocorrências
    reportsStore.ts       Implementação SQLite para Android e iOS
    reportsStore.web.ts   Implementação IndexedDB para navegador
  theme/
    colors.ts             Paleta e mapeamento visual de risco
    styles.ts             Tipografia, espaçamentos, layout e StyleSheets
  types/
    index.ts              Contratos TypeScript da aplicação
tests/
  requirements.test.cjs   Testes automatizados em Node
```

## Contratos de dados (`src/types/index.ts`)

```ts
export type RiskLevel = 'NORMAL' | 'ATENCAO' | 'CRITICO';

export interface WeatherData {
  temperature: number;
  precipitation: number;
  rainProbability: number;
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
```

## Consumo de dados

### API de meteorologia (`src/services/weatherApi.ts`)

- Faz `GET` para `https://api.open-meteo.com/v1/forecast` com:
  - `latitude=-23.5614` e `longitude=-46.6559`;
  - `current=temperature_2m,precipitation,rain`;
  - `hourly=precipitation_probability`;
  - `forecast_days=1`;
  - `timezone=America%2FSao_Paulo`.
- Usa `AbortController` com tempo limite de **10 segundos**.
- Extrai a hora de `data.current.time` (`YYYY-MM-DDTHH:mm`) para ler a probabilidade correspondente em `data.hourly.precipitation_probability`, evitando depender do fuso configurado no aparelho.
- Valida se temperatura, precipitação e probabilidade são números finitos dentro dos intervalos esperados.
- Em erro de rede, status HTTP não OK ou payload incompleto, lança erro. O serviço **não retorna medições fictícias** quando a API falha.

Regras para `conditionText`:

| Condição | Texto retornado |
| --- | --- |
| `precipitation > 5` ou `rainProbability >= 75` | `Possibilidade de chuva forte na região` |
| `precipitation > 0` ou `rainProbability >= 40` | `Chuva leve a moderada prevista` |
| Caso contrário | `Tempo estável e sem chuva` |

### Sensores simulados (`src/services/iotSensors.ts`)

Retorna quatro sensores fixos após 400 ms:

| ID | Local | Bairro | Nível | Capacidade | Estado |
| --- | --- | --- | --- | --- | --- |
| `ESP32-01` | Córrego Anhangabaú - Trecho Baixo | Centro / República | 145 cm | 160 cm | `CRITICO` |
| `ESP32-02` | Av. 23 de Maio - Viaduto Tutóia | Vila Mariana | 88 cm | 150 cm | `ATENCAO` |
| `ESP32-03` | Rua Vergueiro - Estação Paraíso | Paraíso | 25 cm | 120 cm | `NORMAL` |
| `ESP32-04` | Marginal Tietê - Ponte das Bandeiras | Santana / Centro | 132 cm | 150 cm | `CRITICO` |

### Controle de requisições (`src/hooks/useAsyncResource.ts`)

Centraliza `data`, `loading`, `error`, `reload` e `setData`. Um contador interno (`requestId`) ignora respostas atrasadas quando uma nova leitura já foi iniciada ou quando o componente foi desmontado.

## Persistência local

As telas chamam `src/storage/reportsDb.ts`:

- `getReports()`: lê os registros e ordena do mais recente para o mais antigo pelo prefixo numérico do `id`.
- `addReport(report)`: valida endereço e bairro, gera `id` (`timestamp-sufixo`), formata `createdAt` em `pt-BR` e grava com `resolved: false`.
- `toggleReportResolved(id)`: inverte o estado `resolved`.
- `deleteReport(id)`: remove o registro pelo `id`.

O Metro escolhe a implementação de armazenamento conforme a plataforma:

### Android e iOS (`src/storage/reportsStore.ts`)

- Usa **Expo SQLite** no arquivo `eco-vision.db`.
- Ativa `PRAGMA journal_mode = WAL;`.
- Cria a tabela `citizen_reports` com restrições `CHECK` para `category`, `severity` e `resolved`:

```sql
CREATE TABLE IF NOT EXISTS citizen_reports (
  id TEXT PRIMARY KEY NOT NULL,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('ALAGAMENTO','BUEIRO_ENTUPIDO','RISCO_DESLIZAMENTO')),
  severity TEXT NOT NULL CHECK(severity IN ('NORMAL','ATENCAO','CRITICO')),
  description TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0 CHECK(resolved IN (0,1))
);
```

- Todas as operações de escrita usam parâmetros vinculados (`?`).

### Web (`src/storage/reportsStore.web.ts`)

- Usa **IndexedDB** no banco `eco-vision`, com as object stores `reports` (`keyPath: 'id'`) e `metadata`.
- Existe para que a prévia no navegador funcione sem exigir configuração de WebAssembly/cabeçalhos COOP-COEP do `expo-sqlite` na web.

### Migração de registros antigos (`src/storage/legacyReports.ts`)

- Na primeira inicialização do banco (`PRAGMA user_version < 1` no SQLite ou ausência da chave `legacyMigration` no IndexedDB), o app lê `@econ_vision:citizen_reports_v1` do `AsyncStorage`.
- Se não houver dados antigos, o histórico começa vazio.
- Se houver registros válidos, eles são copiados para o novo banco e a migração é marcada como concluída, sem apagar a chave antiga.
- Se o conteúdo antigo estiver corrompido, o erro é propagado para a interface e a migração não é marcada como concluída.
