# Documentação do Eco Vision

Documentação técnica e funcional do aplicativo **Eco Vision**, desenvolvido para a **Global Solution 2026.2 — CitizenTech (FIAP)** na disciplina de **Mobile Development & IoT**.

## O que o aplicativo faz

O Eco Vision reúne, em uma interface pensada para celular:

- consulta meteorológica pública de São Paulo pela API **Open-Meteo**;
- visualização de quatro pontos de monitoramento com leituras e sugestões de desvio **simuladas**;
- registro e acompanhamento de ocorrências no dispositivo, com persistência local;
- acesso ao discador para números de emergência e orientações de segurança durante chuvas.

## Limites importantes

- **Sem sensores físicos conectados:** `src/services/iotSensors.ts` retorna dados fixos com atraso simulado de 400 ms.
- **Sem cálculo de rotas ou trânsito:** as orientações exibidas em cada ponto são textos ilustrativos e não confirmam se uma via está livre.
- **Sem servidor ou rede comunitária:** os registros ficam apenas no aparelho onde foram criados.
- **Sem acionamento automático de socorro:** a tela SOS usa `tel:` para abrir o discador do telefone; a ligação depende da confirmação do usuário no aparelho.
- **Sem coleta de localização ou cadastro:** a previsão usa coordenadas fixas do centro expandido de São Paulo (`-23.5614, -46.6559`).

## Guias disponíveis

| Documento | Conteúdo |
| --- | --- |
| [`telas-e-fluxos.md`](./telas-e-fluxos.md) | Jornada do usuário, telas, estados de carregamento, erro e lista vazia. |
| [`arquitetura-e-dados.md`](./arquitetura-e-dados.md) | Estrutura de pastas, rotas, serviços, modelo de dados, SQLite, IndexedDB e migração. |
| [`tema-e-acessibilidade.md`](./tema-e-acessibilidade.md) | Paleta, escala tipográfica, espaçamentos, componentes reutilizáveis e cuidados de acessibilidade. |
| [`execucao-e-testes.md`](./execucao-e-testes.md) | Como executar, comandos de verificação, cobertura real dos testes e roteiro de validação manual. |
