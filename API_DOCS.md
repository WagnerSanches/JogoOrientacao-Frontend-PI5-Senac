# PI5 API — Documentação de Referência

Base URL: `https://pi5-api-production.up.railway.app`
Versão: `0.1.0`

## Autenticação

A maioria dos endpoints requer Bearer Token no header:
Authorization: Bearer SEU_TOKEN_AQUI

O token é obtido ao cadastrar um jogador via `POST /api/v1/players`.

---

## Players

### POST /api/v1/players
Cadastrar jogador. **Não requer autenticação.**

**Request body:**
```json
{
  "group_name": "Nome do Grupo",
  "ai_player_name": "Nome do Agente",
  "ai_player_avatar": "https://url-da-imagem.com/avatar.png",
  "ai_player_description": "Descrição da estratégia",
  "ai_player_move_endpoint": "https://sua-api.com/move"
}
```
> `group_name` é obrigatório. Os demais são opcionais.
> Se `ai_player_move_endpoint` não for informado, usa o bot aleatório interno.

**Response 201:**
```json
{
  "id": 12,
  "group_name": "Grupo Alpha",
  "ai_player_name": "AlphaBot",
  "ai_player_avatar": "https://example.com/avatar.png",
  "ai_player_description": "Bot com estratégia heurística",
  "ai_player_move_endpoint": "https://alpha.up.railway.app/move",
  "games_played": 0,
  "games_won": 0,
  "games_lost": 0,
  "average_move_time": null,
  "player_access_token": "SEU_TOKEN_AQUI"
}
```

---

### GET /api/v1/players 🔒
Listar todos os jogadores cadastrados.

**Response 200:** array de jogadores (sem o token)

---

### PUT /api/v1/players/{player_id} 🔒
Atualizar o endpoint de movimento da IA.

**Request body:**
```json
{
  "ai_player_move_endpoint": "https://nova-url.com/move"
}
```
> Enviar string vazia `""` remove o endpoint e volta ao bot aleatório.

---

## Games

### POST /api/v1/games 🔒
Criar partida.

**Request body:**
```json
{
  "player_id": 12,
  "team_slot": 1,
  "vs_random_bot": false,
  "auto_start": true
}
```
> `team_slot`: 1 = Turing, 2 = Lovelace
> `vs_random_bot`: true = joga contra bot aleatório interno
> `auto_start`: false = partida fica pausada até chamar /start

**Response 201:** GameRead (ver schema abaixo)

---

### GET /api/v1/games 🔒
Listar partidas com filtros opcionais.

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| status | string | WAITING_PLAYERS, PLAYING, PAUSED, FINISHED |
| player_id | integer | filtrar por jogador |
| started_after | datetime | |
| started_before | datetime | |
| created_after | datetime | |
| created_before | datetime | |
| page | integer | padrão: 1 |
| page_size | integer | padrão: 20, máx: 100 |

---

### GET /api/v1/games/{game_id} 🔒
Buscar detalhes de uma partida.

---

### POST /api/v1/games/{game_id}/join 🔒
Entrar em uma partida aberta.

**Request body:**
```json
{
  "player_id": 12,
  "team_slot": 1
}
```

---

### POST /api/v1/games/{game_id}/start 🔒
Iniciar partida manualmente (quando auto_start=false).

**Request body (opcional):**
```json
{
  "reason": "Motivo opcional"
}
```

---

### POST /api/v1/games/{game_id}/stop 🔒
Encerrar partida manualmente.

**Request body (opcional):**
```json
{
  "reason": "Motivo opcional"
}
```

---

### POST /api/v1/games/{game_id}/spectators 🔒
Registrar espectador na partida.

**Request body:**
```json
{
  "spectator_name": "Nome do Espectador",
  "spectator_avatar": "https://url-avatar.com/img.png"
}
```

---

### POST /api/v1/games/mock-state
Gerar estado mock para testes. **Não requer autenticação.**
Pode receber um GameStreamDTO no body para avançar o estado.
Se enviado sem body, gera um estado aleatório.

---

## Schemas

### GameStreamDTO
```json
{
  "game_id": "uuid",
  "status": "PLAYING",
  "winner_team": null,
  "turn_number": 1,
  "turn_team_id": 1,
  "turn_phase": "setup_placement",
  "board": [
    [
      { "level": 0, "professor": "CLARO" },
      { "level": 0, "professor": null }
    ]
  ],
  "last_action": null
}
```

### GameStatus
- `WAITING_PLAYERS` → Aguardando Jogadores
- `PLAYING` → Em Andamento
- `PAUSED` → Pausado
- `FINISHED` → Finalizado

### TurnPhase
- `setup_placement` → Posicionamento dos Professores
- `player_turn` → Turno do Jogador

### TeamID
- `1` → Time Turing (CLARO + REY)
- `2` → Time Lovelace (KARIN + BEATRIZ)

### Cell (cada célula do tabuleiro)
```json
{
  "level": 0,
  "professor": "CLARO"
}
```
> `level`: 0 a 4 (0=Calouro, 4=Pronto para graduar)
> `professor`: "CLARO", "REY", "KARIN", "BEATRIZ" ou null

### Níveis dos alunos
- `0` → Calouro
- `1` → 1º Ano
- `2` → 2º Ano
- `3` → 3º Ano
- `4` → Pronto para orientação (TCC)
- Graduado → célula fica vazia após orientação

---

## Endpoint da sua IA (Backend do grupo)

A API do professor vai chamar este endpoint quando for a vez do seu jogador:

### POST /move (seu servidor)

**Request body que você vai receber:**
```json
{
  "game_id": "uuid",
  "status": "PLAYING",
  "winner_team": null,
  "turn_number": 5,
  "turn_team_id": 1,
  "turn_phase": "player_turn",
  "board": [...],
  "last_action": null
}
```

**Response que você deve retornar em até 5 segundos:**
> Formato exato a confirmar na próxima aula do professor.

---

## Restrições do jogador inteligente

- Responder em **≤ 5 segundos**
- Retornar **jogada válida**
- **Não pode perder do bot aleatório** do professor

Qualquer uma dessas violada = **derrota automática**

---

## WebSocket

O frontend espectador vai usar WebSocket para receber atualizações
em tempo real. Detalhes na próxima aula do professor.