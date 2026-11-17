# Telas e fluxos do usuário

A navegação principal usa **Expo Router** com abas inferiores em `src/app/(tabs)/_layout.tsx` e um cabeçalho compartilhado em `src/components/AppHeader.tsx`.

## Cabeçalho e tela Sobre

- Mostra a marca **Eco Vision**, o subtítulo e a referência fixa **São Paulo**.
- Tocar no bloco da marca abre `src/app/modal.tsx` (**Sobre o Eco Vision**), que explica a origem dos dados, o armazenamento no dispositivo e os limites das informações.
- Na tela Sobre há um link externo para `https://open-meteo.com/` e um botão para voltar ao aplicativo.

## 1. Radar (`src/app/(tabs)/index.tsx`)

Tela inicial da jornada. Reúne três fontes independentes:

| Bloco | Origem | Estados tratados |
| --- | --- | --- |
| **Condições da região** | Mock de sensores (`fetchIoTSensors`) | Indicador de consulta, erro com botão **Tentar novamente**, ausência de sensores, contagem de sensores críticos ou indicação de ausência de pontos críticos. Tocar no cartão leva para **Sensores**. |
| **O tempo agora** | API Open-Meteo (`fetchLocalWeather`) | Carregamento inicial, erro com **Tentar novamente** e exibição de temperatura, texto da condição, chuva em `mm` e probabilidade de chuva em `%`. Se uma atualização falhar depois de uma leitura válida, os últimos dados continuam visíveis com aviso de possível desatualização. |
| **Pontos de atenção** | Sensores com `status === 'CRITICO'` | Lista de cartões resumidos ou mensagem informando que não há sensores críticos no momento. |
| **Comunidade / registro** | Banco local (`getReports`) | Mostra quantas ocorrências não resolvidas existem no dispositivo, trata erro de leitura local e leva para **Reportar**. |

A tela pode ser atualizada pelo botão no topo ou pelo gesto de puxar para atualizar. Ao voltar para a aba Radar, a contagem de ocorrências locais é recarregada.

## 2. Sensores (`src/app/(tabs)/sensors.tsx`)

Permite consultar todos os trechos simulados:

- **Resumo da rede:** mostra o total de pontos monitorados e a identificação `DEMO`.
- **Busca:** filtra por nome da via, bairro ou código (`ESP32-01` a `ESP32-04`), ignorando maiúsculas/minúsculas e acentos.
- **Filtros por estado:** `Todos`, `Críticos`, `Atenção` e `Normais`, com contagem por categoria.
- **Cartão detalhado (`SensorCard`):** exibe selo de risco, código em fonte monoespaçada, bairro, percentual de ocupação, barra de nível, medição em centímetros, horário simulado e orientação de rota.
- **Lista vazia:** quando a combinação de busca e filtro não encontra sensores, exibe mensagem explicativa e o botão **Limpar busca e filtros**.
- **Erro:** se a leitura falhar, mostra `LoadError` com opção de tentar novamente e não apresenta contagens antigas como atuais.

## 3. Reportar (`src/app/(tabs)/report.tsx`)

Concentra o cadastro e o histórico local de ocorrências:

### Cadastro

- **Campos obrigatórios:** endereço/referência (`máx. 160` caracteres) e bairro (`máx. 80` caracteres).
- **Tipo de ocorrência:** `Rua alagada` (`ALAGAMENTO`), `Bueiro entupido` (`BUEIRO_ENTUPIDO`) ou `Risco de deslizamento` (`RISCO_DESLIZAMENTO`).
- **Gravidade:** `Atenção` (`ATENCAO`, passagem parcial) ou `Crítico` (`CRITICO`, via bloqueada).
- **Observações:** campo opcional (`máx. 600` caracteres). Quando fica em branco, o app grava `Ocorrência registrada pelo cidadão via Eco Vision.`
- **Validação:** se endereço ou bairro estiverem vazios, o app destaca os campos obrigatórios, exibe mensagens específicas e move o foco para o primeiro campo pendente.
- **Proteção contra indisponibilidade do banco:** o botão de salvar fica desabilitado enquanto o histórico inicial carrega, durante uma gravação ou quando a abertura do banco local falha.

### Histórico ("Seus registros")

- Exibe total de registros salvos e quantos estão em aberto.
- Cada cartão mostra estado (`Atenção`, `Crítico` ou `Resolvido`), data/hora de criação, endereço, bairro, categoria e descrição.
- **Marcar resolvido / Reabrir registro:** alterna o campo `resolved` no banco local.
- **Excluir:** abre confirmação no próprio cartão antes de remover o registro.
- **Lista vazia:** quando não há ocorrências salvas, mostra mensagem informando que os próximos registros aparecerão ali.

## 4. SOS (`src/app/(tabs)/sos.tsx`)

- Apresenta atalhos para **Defesa Civil (`199`)**, **Bombeiros (`193`)** e **SAMU (`192`)**.
- Tocar em um contato chama `Linking.openURL('tel:...')`. Se o dispositivo ou navegador não puder abrir o discador, a tela mostra uma mensagem de alerta informando o número para discagem manual.
- Reúne três orientações de segurança: não atravessar áreas alagadas a pé, evitar dirigir em alagamentos e manter distância da rede elétrica.

## 5. Rota inexistente (`src/app/+not-found.tsx`)

Exibe uma tela simples quando um endereço inválido é acessado e oferece link direto para voltar ao Radar.
