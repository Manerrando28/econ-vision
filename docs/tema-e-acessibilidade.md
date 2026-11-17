# Tema centralizado e acessibilidade

## Organização do tema

As decisões visuais ficam concentradas em dois arquivos:

- `src/theme/colors.ts`: cores da interface, bordas, fundos e função `getRiskStyle(level)`.
- `src/theme/styles.ts`: constantes `FONT`, `SPACE`, `LAYOUT`, estilos de navegação e `StyleSheet`s das telas e componentes.

Um teste automatizado em `tests/requirements.test.cjs` percorre a árvore sintática TypeScript de `src/` e falha caso encontre cores hexadecimais/`rgb()` ou literais de fonte e espaçamento fora de `src/theme/`.

## Paleta principal

| Token | Valor | Uso | Contraste com `surface` (`#121F28`) |
| --- | --- | --- | --- |
| `background` | `#0A1218` | Fundo principal das telas e abas | — |
| `surface` | `#121F28` | Cartões e blocos de conteúdo | — |
| `primary` | `#65E0BB` | Destaques, links e botões principais | — |
| `onPrimary` | `#08261F` | Texto e ícones sobre `primary` (`9,89:1`) | — |
| `textPrimary` | `#F0F6F8` | Títulos e valores principais | `15,37:1` |
| `textSecondary` | `#B6C6D0` | Textos de apoio e descrições | `9,56:1` |
| `textMuted` | `#91A7B5` | Metadados, legendas e placeholders | `6,71:1` |

## Semântica de risco

Os estados nunca dependem apenas da cor; `RiskBadge` combina **ícone + cor + texto**:

| Nível | Rótulo padrão | Fundo | Borda | Texto / ícone | Contraste texto/fundo |
| --- | --- | --- | --- | --- | --- |
| `NORMAL` | `Normal` (ou `Resolvido` no histórico) | `#102F29` | `#4DCEA7` | `#83E7C4` | `9,72:1` |
| `ATENCAO` | `Atenção` | `#332B1B` | `#E8B65A` | `#F3CD83` | `9,23:1` |
| `CRITICO` | `Crítico` | `#341F26` | `#EF8491` | `#FFABB5` | `8,57:1` |

## Tipografia, espaçamento e layout

- **Escala tipográfica (`FONT.size`):** `micro: 10`, `caption: 12`, `body: 14`, `input: 16`, `section: 18`, `brand: 20`, `metric: 24`, `title: 28`, `temperature: 56`.
- **Fonte monoespaçada:** `SpaceMono`, usada nos códigos dos módulos (`ESP32-01` etc.).
- **Escala de espaçamento (`SPACE`):** `0`, `1`, `4`, `8`, `12`, `16`, `20`, `24` e `32`.
- **Largura máxima (`LAYOUT`):** conteúdo centralizado em até `560` pontos, mantendo estrutura de coluna única para celular mesmo quando aberto em telas largas.
- **Alvos de toque:** altura mínima de `44` pontos para ações principais, filtros, cabeçalho e botões de atualização/exclusão.

## Cuidados de acessibilidade implementados

- **Áreas seguras e teclado:** `SafeAreaView` no cabeçalho, espaçamento inferior calculado com `useSafeAreaInsets` na barra de abas e `KeyboardAvoidingView` na tela de formulário.
- **Leitores de tela:** uso de `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, `accessibilityLiveRegion="polite"` e `aria-pressed` nos botões de filtro/seleção.
- **Barras de nível:** `SensorCard` define `accessibilityRole="progressbar"`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow` e `aria-valuetext` em centímetros.
- **Formulário:** campos de texto com fonte `16`, mensagens de erro específicas por campo e foco automático no primeiro campo obrigatório vazio ao tentar salvar.
- **Linguagem:** textos diretos voltados ao cidadão, sem instruções internas de avaliação na interface.

Esses recursos ajudam na leitura e navegação, mas não substituem testes manuais com TalkBack (Android), VoiceOver (iOS) e fonte ampliada do sistema.
