# Execução, verificação e testes

## Requisitos do ambiente

- **Node.js:** `^22.13.0` ou `^24.3.0` (ou versão superior compatível com o Expo SDK 58).
- **npm:** incluído com o Node.js.
- **Para celular físico:** aplicativo **Expo Go** compatível com o SDK 58, na mesma rede do computador.
- **Para navegador:** qualquer navegador moderno com suporte a IndexedDB.

## Executando em desenvolvimento

```bash
npm ci
npx expo start --clear
```

Atalhos úteis no terminal do Expo:

- ler o QR Code no **Expo Go** (Android/iOS);
- pressionar `a` para Android Emulator, se configurado na máquina;
- pressionar `i` para iOS Simulator (macOS);
- pressionar `w` ou rodar `npm run web` para abrir no navegador.

Se dependências forem instaladas ou arquivos de rota em `src/app/` forem movidos, reinicie o servidor do Expo com `--clear`.

## Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento do Expo. |
| `npm run android` | Inicia o Expo apontando para Android. |
| `npm run ios` | Inicia o Expo apontando para iOS. |
| `npm run web` | Inicia o Expo para navegador. |
| `npm run lint` | Executa `expo lint src`. |
| `npm run typecheck` | Executa `tsc --noEmit` com `strict: true`. |
| `npm test` | Executa os testes automatizados em `tests/*.test.cjs`. |
| `npx expo-doctor` | Diagnostica configuração e compatibilidade das dependências do Expo. |

## O que `npm test` cobre

O arquivo `tests/requirements.test.cjs` transpila os módulos TypeScript reais de `src/` e executa sete testes usando `node:test` e `node:sqlite`:

1. **CRUD em SQLite:** cria uma ocorrência com caracteres especiais e trecho semelhante a SQL injection, confirma que os parâmetros vinculados preservam o texto e a tabela, alterna resolvido/reaberto, reabre o repositório no mesmo banco e exclui o registro.
2. **Migração única:** importa um registro legado do `AsyncStorage`, grava `PRAGMA user_version = 1` e confirma que um item excluído não volta a aparecer.
3. **Dados antigos corrompidos:** garante que JSON inválido gera erro, sem mascarar a falha com dados falsos.
4. **Validação de entrada:** impede salvar ocorrência com endereço em branco antes de tocar no banco.
5. **Hora da previsão:** usa o horário retornado pela Open-Meteo (`America/Sao_Paulo`) para buscar a probabilidade de chuva da hora correta.
6. **Falhas da API de clima:** verifica que erro de rede, HTTP não OK e JSON incompleto rejeitam a promessa em vez de inventar valores.
7. **Tema centralizado:** analisa a AST de todos os arquivos `.ts`/`.tsx` em `src/` (exceto `src/theme/`) e bloqueia literais de cor, fonte e espaçamento fora do tema.

## Limitações dos testes automatizados

- Em Node, o SQLite é real (`node:sqlite` em memória), mas a chamada `openDatabaseAsync` do `expo-sqlite` é substituída por uma ponte de teste porque o runtime nativo do Expo não existe fora do app.
- No navegador, a persistência usa IndexedDB (`reportsStore.web.ts`), não o arquivo SQLite nativo (`reportsStore.ts`).
- Exportar bundles com `npx expo export` valida o empacotamento para Android, iOS e web, mas não substitui abrir o app em um aparelho ou emulador.

## Roteiro de validação manual no celular

1. Abrir o app no Expo Go e verificar o carregamento do **Radar** e das quatro abas.
2. Tocar no cabeçalho **Eco Vision** para abrir a tela **Sobre** e voltar.
3. Em **Sensores**, buscar `Anhangabau` (sem acento), alternar os filtros (`Críticos`, `Atenção`, `Normais`) e buscar um termo inexistente para testar o estado vazio e o botão **Limpar busca e filtros**.
4. Em **Reportar**, tocar em **Salvar ocorrência** com campos vazios para verificar o aviso e o foco no campo obrigatório.
5. Cadastrar uma ocorrência com endereço fictício, fechar e reabrir o app no celular e confirmar que o registro permanece salvo no SQLite.
6. Marcar o registro como resolvido, reabri-lo e excluí-lo confirmando a exclusão.
7. Desativar a internet do aparelho e atualizar o **Radar**: o cartão de clima deve exibir erro com **Tentar novamente**, enquanto sensores simulados e registros locais continuam acessíveis.
8. Na tela **SOS**, conferir o layout e os textos de segurança sem realizar chamadas reais para 199, 193 ou 192.
