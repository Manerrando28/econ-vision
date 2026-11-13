# Econ Vision — Monitoramento Preditivo e Colaborativo de Alagamentos

Aplicativo mobile desenvolvido em **React Native (Expo + TypeScript)** para a **Global Solution 2026.2 — CitizenTech (FIAP)** na disciplina de **Mobile Development & IoT**.

---

👥 Integrantes da Equipe
Gabriel Guilherme Leste — RM: 558638

Gabriel Lacerda — RM: 558307

Fernando Carlos — RM: 558095

Julia Carolina — RM: 558896
_ _ _

## 📋 Ficha da CitizenTech

* **Nome da CitizenTech:** Econ Vision
* **Cidade e Bairro:** São Paulo – SP (Foco inicial na região da Av. Paulista, Centro/Anhangabaú e corredores de mobilidade urbana)
* **Cidadão Beneficiado:** Trabalhadores, estudantes, idosos, pessoas com deficiência e motoristas que dependem do transporte urbano e enfrentam riscos diários com enchentes e alagamentos repentinos.
* **Problema (em uma frase):** A falta de informação hiperlocal, acessível e em tempo real sobre o nível de água em vias e bueiros expõe cidadãos a riscos físicos, bloqueios no trânsito e perdas materiais durante chuvas intensas.
* **Como funciona:** O aplicativo cruza dados meteorológicos reais (API Open-Meteo) com a telemetria de sensores ultrassônicos IoT (ESP32) instalados em pontos críticos, exibe rotas alternativas seguras, permite que a própria comunidade registre ocorrências offline/online (bueiros entupidos e ruas alagadas) e oferece acionamento rápido de emergência (SOS).
* **O que cada parte faz:**
  * **Radar Urbano (`index.tsx`):** Consome a API pública Open-Meteo em tempo real e destaca os pontos críticos detectados pelos sensores.
  * **Sensores IoT & Rotas (`sensors.tsx`):** Exibe a medição em centímetros e percentual de ocupação das calhas/bueiros monitorados por ESP32, com filtros por gravidade e sugestões de desvio.
  * **Alerta Colaborativo (`report.tsx`):** CRUD completo persistido localmente (`AsyncStorage`) para que o cidadão registre, acompanhe, marque como resolvido ou exclua alertas no bairro mesmo com oscilação de internet.
  * **Emergência & Guia (`sos.tsx`):** Discagem direta em 1 toque para Defesa Civil (199), Bombeiros (193) e SAMU (192), além de protocolos preventivos de segurança.
* **Indicador de Impacto:** Redução do tempo de exposição de pedestres e veículos a áreas alagadas, aumento do número de bueiros desobstruídos preventivamente via reporte comunitário e agilidade no acionamento de socorro.
* **ODS da ONU Conectados:**
  * **ODS 11 — Cidades e Comunidades Sustentáveis:** Aumenta a resiliência urbana frente a desastres hídricos e melhora a segurança na mobilidade cidadã.
  * **ODS 13 — Ação Contra a Mudança Global do Clima:** Fortalece a capacidade de adaptação e alerta precoce a eventos climáticos extremos (tempestades e enxurradas).
  * **ODS 9 — Indústria, Inovação e Infraestrutura:** Integra sensores IoT de baixo custo (ESP32) a plataformas digitais acessíveis à população.

---

## 🛠️ Tecnologias Utilizadas

* **React Native** com **TypeScript**
* **Expo SDK & Expo Router** (Navegação baseada em arquivos com Bottom Tabs)
* **Open-Meteo API** (Consumo REST de dados meteorológicos reais de São Paulo)
* **AsyncStorage** (Persistência local Offline-First dos reportes comunitários)
* **Lucide React Native** (Iconografia semântica de alta legibilidade)

---

## ♿ Acessibilidade e Inclusão

* **Alto Contraste (WCAG):** Paleta escura com contraste superior a 9:1 entre texto e fundo.
* **Semântica Visual Redundante:** Status de risco combinam **cor + ícone + texto explícito** (`NÍVEL NORMAL`, `ATENÇÃO / RISCO`, `ALAGAMENTO CRÍTICO`), garantindo leitura clara para pessoas daltônicas e não-especialistas.
* **Alvos de Toque Amplos & Leitores de Tela:** Uso de `accessibilityRole` e `accessibilityLabel` nos botões principais e acionamento de emergência em 1 toque.

---

## 📸 Telas do Aplicativo

| Radar Urbano | Sensores IoT | Reporte Colaborativo | SOS Emergência |
| :---: | :---: | :---: | :---: |
| ![Tela Radar Urbano](./docs/tela-radar.png) | 
![Tela Sensores IoT](./docs/tela-sensores.png) |
![Tela Reportar Alagamento](./docs/tela-reportar.png) |
![Tela SOS Emergência](./docs/tela-sos.png) |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js (v18 ou superior)
* Aplicativo **Expo Go** instalado no celular (Android/iOS) ou navegador Web

### Passo a passo
```bash
# 1. Clone o repositório
git clone [https://github.com/Manerrando28/econ-vision.git](https://github.com/Manerrando28/econ-vision.git)

# 2. Acesse a pasta do projeto
cd econ-vision

# 3. Instale as dependências
npm install

# 4. Inicie o servidor Expo
npx expo start -c
Leia o QR Code no terminal com o aplicativo Expo Go (Android/iOS) ou pressione w para abrir no navegador.

🎥 Vídeo Demonstrativo (Pitch)
Link do vídeo (YouTube): [COLE AQUI O LINK DO VÍDEO DE ATÉ 3 MINUTOS]

🙏 Agradecimentos
Agradecemos à FIAP e ao corpo docente do curso de Engenharia de Software pela proposta da Global Solution 2026.2 — CitizenTech,
 que nos desafiou a olhar para problemas reais da cidade e transformar tecnologia em impacto social concreto.
 Nosso agradecimento especial ao professor da disciplina de Mobile Development & IoT pelas orientações
 técnicas ao longo do semestre e a todos os cidadãos que inspiraram a construção do Econ Vision.
