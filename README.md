# Jogo da Orientação — Frontend

Frontend do Projeto Integrador 5 do Senac. Aplicação web para
acompanhar partidas do **Jogo da Orientação** em tempo real.

---

## O que a aplicação faz

- 🔐 Cadastro e autenticação de jogadores
- 📋 Listagem de partidas em andamento e finalizadas
- 🎮 Criar novas partidas (vs bot aleatório ou aguardando jogador)
- 🤝 Entrar em partidas abertas como jogador
- 👁️ Assistir partidas em tempo real via WebSocket
- 📊 Ver detalhes e estatísticas de partidas finalizadas

---

## Como rodar

### Requisitos
- Node.js 20+
- npm

### Setup

```bash
# Instalar dependências
npm install

# Criar arquivo .env a partir do exemplo (obrigatório antes de rodar)
cp .env.example .env
# Edite o .env se precisar apontar para outra URL de API
```

> **Atenção (Windows/PowerShell):** não use `echo ... > .env` no PowerShell —
> ele gera UTF-16 LE, que o Vite não consegue ler e a aplicação quebra com
> `Failed to construct 'URL': Invalid URL`. Use `cp .env.example .env` ou edite
> o arquivo diretamente no editor.

```bash
# Rodar em modo desenvolvimento
npm run dev
```

Acessa: http://localhost:5000

### Build de produção

```bash
npm run build
npm run preview
```

---

## Estrutura do projeto

```
src/
├── routes/                  # Páginas da aplicação
│   ├── auth.page.jsx        # Cadastro/login do jogador
│   ├── watch.page.jsx       # Listagem de partidas
│   ├── watch-game.page.jsx  # Visualização de uma partida
│   ├── create-game.page.jsx # Criar nova partida
│   └── join-game.page.jsx   # Entrar em partida aberta
│
├── components/              # Componentes reutilizáveis
│   └── auth-guard.jsx       # Proteção de rotas
│
├── hooks/
│   └── useGameSocket.js     # Hook de WebSocket
│
├── lib/
│   ├── api.js               # Cliente HTTP central
│   ├── games-api.js         # Endpoints da API
│   └── schemas.js           # Validações Zod
│
├── context/
│   └── game-context.jsx     # Estado global (jogador, espectadores)
│
├── app.jsx                  # Rotas
├── app.layout.jsx           # Layout global
└── main.jsx                 # Entry point
```

## Fluxo de uso

1. **Cadastro** → o usuário cadastra um novo jogador ou cola um token existente
2. **Listagem** → vê todas as partidas, filtra por status (Ao vivo, Aguardando, Finalizadas)
3. **Criar partida** → escolhe time (Turing/Lovelace) e oponente (bot ou aguardar jogador)
4. **Assistir** → registra como espectador e conecta via WebSocket para acompanhar em tempo real
5. **Detalhes** → ao final, vê tabuleiro final, vencedor e estatísticas

---

## Como funciona o WebSocket

A página de espectador conecta em:

```
wss://pi5-api-production.up.railway.app/api/v1/ws/games/{gameId}?token=...
```

A cada movimento dos jogadores, o servidor envia o novo estado do jogo
e o tabuleiro atualiza automaticamente.

O hook `useGameSocket` gerencia a conexão, parse das mensagens e
reconexão automática em caso de queda.

---

## Stack

| | |
|---|---|
| Build tool | Vite 8 |
| Framework | React 19 |
| Roteamento | React Router 7 |
| Estilização | Tailwind CSS 4 |
| Formulários | React Hook Form + Zod |
| Comunicação | Fetch API + WebSocket nativo |
| Linguagem | JavaScript (sem TypeScript) |

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores conforme necessário.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_BASE_URL` | Sim | URL base da API backend (ex: `https://pi5-api-production.up.railway.app`) |

> O arquivo `.env` deve estar em **UTF-8** (sem BOM). No PowerShell, prefira
> `cp .env.example .env` — o operador `>` cria arquivos UTF-16 LE que o Vite
> não consegue ler.

---

## Notas

- A aplicação roda 100% no navegador (SPA)
- Estado do jogador e espectadores é persistido no `localStorage`
- O frontend não precisa estar deployado para ser avaliado — pode rodar local

---

## Autor

Wagner Sanches — Senac, Análise e Desenvolvimento de Sistemas
