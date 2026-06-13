# REPORT — Frontend Jogo da Orientação

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


## Motivação

O projeto foi organizado em camadas com responsabilidades separadas:
`routes/`, `components/`, `context/`, `lib/` e `hooks/`. A ideia
dessa divisão foi criar componentes independentes que pudessem ser
reutilizados em diferentes páginas, apenas recebendo os dados por props.
Isso permitiu, por exemplo, que `Cell` e `PlayerAvatar` fossem usados
tanto na tela de partida em andamento (`watch-game.page.jsx`) quanto na
tela de partida finalizada (`finished-game-view.jsx`), sem duplicar
código de exibição do tabuleiro ou dos jogadores.

A comunicação com a API foi centralizada em `lib/api.js`
(`apiClient`), responsável por montar URLs, injetar o token de
autenticação automaticamente e padronizar erros HTTP. `lib/games-api.js`
é apenas uma lista de funções (uma por endpoint) sobre esse cliente. 
Essa divisão foi feita para que qualquer página que precise chamar a API só
importe a função correspondente sem se inportar com nenhum tipo de tratamento.

O estado global ficou concentrado em um único Context
(`game-context.jsx`), guardando o jogador autenticado e os tokens de
espectador por partida. Essa decisão foi tomada pela necessidade desses dados
em muitos componentespor isso a persistência automática em
`localStorage` dentro do próprio Provider, via `useEffect`.

A autenticação em si (`AuthGuard`) foi feita como um componente de rota
separado, usando `Outlet`/`Navigate` do React Router. Isso permitiu
agrupar todas as rotas protegidas em `app.jsx` dentro de um único bloco,
sem repetir verificação de login em cada página individualmente.

## Fluxo principal e como os componentes se encaixam

O fluxo da aplicação segue a ordem: **autenticação → listagem → criação/
entrada → visualização**. Cada etapa virou uma página em `routes/`, e a
página de visualização (`watch-game.page.jsx`) é a mais complexa porque
precisa decidir, em tempo de execução, qual "modo" mostrar:

- se a partida já terminou, delega tudo para `FinishedGameView`;
- se o usuário ainda não tem token de espectador para aquela partida,
  delega para `SpectatorRegisterForm`;
- caso contrário, abre o WebSocket (`useGameSocket`) e renderiza o
  tabuleiro ao vivo.

Essa divisão em "modos" foi pensada para que cada parte do fluxo virasse
um componente independente.

O hook `useGameSocket` foi extraído da página porque a lógica de conexão,
parse de mensagens e reconexão automática é relativamente complexa e não
tem nada a ver com layout — isolar isso evitou que `watch-game.page.jsx`
ficasse poluída com lógica de rede, deixando só a renderização do estado
(`{ connected, gameState }`).

Dentro da página de jogo, o estado exibido é uma junção entre o que foi
carregado via REST (`initialGame`) e o que chega pelo WebSocket
(`gameState`).

## Formulários e validação

Todos os formulários (cadastro de jogador, login por token, criação de
partida, registro de espectador) usam React Hook Form + Zod
(`lib/schemas.js`). A motivação foi padronizar a validação em um único
formato declarativo em vez de validação
manual espalhada por cada componente. Em `create-game.page.jsx`,
especificamente, optamos por usar `Controller` porque as opções de
time/oponente são botões customizados (não inputs nativos), então
precisávamos integrar esse estado controlado ao React Hook Form.

## Componentes do tabuleiro e jogadores

`Cell`, `PlayerAvatar` e a lógica de cores por time (azul = Aliança
Turing, rosa = Lovelace) foram extraídos como peças pequenas e
reutilizáveis porque aparecem em duas telas (jogo ativo e jogo
finalizado). A ideia foi que qualquer mudança visual no tabuleiro ou nos
avatares precise ser feita em um único lugar.

`FinishedGameView` foi quebrado em subcomponentes internos
(`WinnerBanner`, `PlayerCard`, `StatCard`, `Board`) só para organizar o
JSX — como esses pedaços não são reutilizados fora dessa tela, não fazia
sentido criar arquivos separados para cada um.

## Persistência local

Além do token do jogador, também persistimos no `localStorage`: o perfil
do espectador (nome/avatar, separado do token por partida) e a preferência
de filtro "apenas minhas partidas" na listagem. A motivação foi evitar que o usuário precise repetir uma ação
(preencher formulário, marcar filtro) a cada vez que recarrega a página.