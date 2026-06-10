import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGameSocket } from "@/hooks/useGameSocket.js";
import { SpectatorRegisterForm } from "@/components/spectator-register-form.jsx";
import { FinishedGameView } from "@/components/finished-game-view.jsx";
import { Cell } from "@/components/cell.jsx";
import { PlayerAvatar } from "@/components/player-avatar.jsx";
import { useGameContext } from "@/context/game-context.jsx";
import { getGame, startGame } from "@/lib/games-api.js";

const STATUS_LABELS = {
  WAITING_PLAYERS: "Aguardando Jogadores",
  PLAYING: "Em Andamento",
  PAUSED: "Pausado",
  FINISHED: "Finalizado",
};

const PHASE_LABELS = {
  setup_placement: "Posicionamento",
  player_turn: "Turno do Jogador",
};

const WINNER_LABELS = {
  1: "Time Turing",
  2: "Time Lovelace",
};

function InfoBadge({ label, value, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-w-[110px]">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-bold ${accent ?? "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function WinnerBanner({ winnerTeam }) {
  const isTeam1 = winnerTeam === 1;
  const label = WINNER_LABELS[winnerTeam];
  const bg = isTeam1 ? "bg-blue-50 border-blue-300" : "bg-rose-50 border-rose-300";
  const text = isTeam1 ? "text-blue-700" : "text-rose-700";
  const accent = isTeam1 ? "text-blue-900" : "text-rose-900";

  return (
    <div className={`rounded-2xl border-2 px-6 py-5 mb-8 flex items-center gap-4 ${bg}`}>
      <span className="text-3xl">🏆</span>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${text}`}>Vencedor</p>
        <p className={`text-xl font-bold ${accent}`}>{label}</p>
      </div>
    </div>
  );
}

function ConnectionBadge({ connected }) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
      Ao vivo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      Desconectado
    </span>
  );
}

function GameInfo({ game }) {
  const teamLabel = game.turn_team_id === 1 ? "Aliança Turing" : "Lovelace";
  const teamAccent = game.turn_team_id === 1 ? "text-blue-600" : "text-rose-600";
  const phaseLabel = PHASE_LABELS[game.turn_phase] ?? game.turn_phase;
  const statusLabel = STATUS_LABELS[game.status] ?? game.status;

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <InfoBadge label="Status" value={statusLabel} accent="text-green-600" />
      <InfoBadge label="Turno" value={`#${game.turn_number}`} />
      <InfoBadge label="Time jogando" value={teamLabel} accent={teamAccent} />
      <InfoBadge label="Fase" value={phaseLabel} />
    </div>
  );
}

export default function WatchGamePage() {
  const { id: gameId } = useParams();
  const [initialGame, setInitialGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const { getSpectatorToken, player } = useGameContext();
  const spectatorToken = getSpectatorToken(gameId);

  // Don't open a WebSocket for finished games
  const effectiveSpectatorToken =
    initialGame?.status === "FINISHED" ? null : spectatorToken;
  const { connected, gameState } = useGameSocket(gameId, effectiveSpectatorToken);

  // Merge: WebSocket drives board/turn, but player/spectator data from initial load
  // is preserved when the WS payload omits those fields
  const displayGame = gameState
    ? {
        ...initialGame,
        ...gameState,
        turing_player: gameState.turing_player || initialGame?.turing_player,
        lovelace_player: gameState.lovelace_player || initialGame?.lovelace_player,
        spectators: gameState.spectators || initialGame?.spectators || [],
      }
    : initialGame;

  async function fetchGame() {
    try {
      setError(null);
      setLoading(true);
      const data = await getGame(gameId);
      console.log("Dados da partida:", data);
      setInitialGame(data);
    } catch (err) {
      console.error("Erro ao carregar partida:", err.status, err.body);
      if (err.status === 401) setError("Token inválido ou expirado.");
      else if (err.status === 404) setError("Partida não encontrada.");
      else setError(err.message ?? "Erro ao carregar a partida.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    try {
      await startGame(gameId);
      const updated = await getGame(gameId);
      setInitialGame(updated);
    } catch (err) {
      console.error("Erro ao iniciar:", err);
      alert(err.body?.detail || "Erro ao iniciar a partida");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!gameId) return;
    fetchGame();
  }, [gameId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 gap-2">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="text-sm">Carregando partida...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2">
        <p className="text-rose-600 font-medium">{error}</p>
      </div>
    );

  if (initialGame?.status === "FINISHED") return <FinishedGameView game={initialGame} />;

  if (!spectatorToken)
    return <SpectatorRegisterForm gameId={gameId} onSuccess={() => {}} />;

  const canStart =
    displayGame?.status !== "PLAYING" &&
    displayGame?.status !== "FINISHED" &&
    !!player?.id &&
    (displayGame?.created_by === player.id ||
      displayGame?.turing_player?.player_id === player.id ||
      displayGame?.lovelace_player?.player_id === player.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Partida</h1>
          <ConnectionBadge connected={connected} />
        </div>
        <p className="text-xs text-gray-400 font-mono">{gameId}</p>
      </div>

      {displayGame && (
        <>
          {displayGame.winner_team != null && (
            <WinnerBanner winnerTeam={displayGame.winner_team} />
          )}

          <GameInfo game={displayGame} />

          {/* Confronto de jogadores */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center bg-white rounded-lg shadow p-4 mb-4">
            <div className="text-center">
              {displayGame.turing_player ? (
                <>
                  <PlayerAvatar
                    src={displayGame.turing_player.ai_player_avatar}
                    name={displayGame.turing_player.ai_player_name}
                    size="md"
                  />
                  <div className="font-bold text-blue-600 text-sm mt-1">
                    {displayGame.turing_player.ai_player_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {displayGame.turing_player.group_name}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic text-sm">Aguardando jogador...</div>
              )}
              <div className="text-xs font-bold text-blue-600 mt-1">ALIANÇA TURING</div>
            </div>

            <div className="text-xl font-bold text-gray-400">VS</div>

            <div className="text-center">
              {displayGame.lovelace_player ? (
                <>
                  <PlayerAvatar
                    src={displayGame.lovelace_player.ai_player_avatar}
                    name={displayGame.lovelace_player.ai_player_name}
                    size="md"
                  />
                  <div className="font-bold text-rose-600 text-sm mt-1">
                    {displayGame.lovelace_player.ai_player_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {displayGame.lovelace_player.group_name}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic text-sm">Aguardando jogador...</div>
              )}
              <div className="text-xs font-bold text-rose-600 mt-1">LOVELACE</div>
            </div>
          </div>

          {/* Espectadores */}
          {displayGame.spectators && displayGame.spectators.length > 0 && (
            <div className="bg-white rounded-lg shadow p-3 mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">
                👁️ Espectadores ({displayGame.spectators.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {displayGame.spectators.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {s.spectator_avatar ? (
                      <img
                        src={s.spectator_avatar}
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <span>👤</span>
                    )}
                    <span className="text-gray-700">{s.spectator_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canStart && (
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium mb-4 transition-colors"
            >
              {starting ? "Iniciando..." : "▶ Iniciar Partida"}
            </button>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-400 inline-block"></span>
                Aliança Turing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-400 inline-block"></span>
                Lovelace
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block"></span>
                Vazio
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {displayGame.board.map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <Cell key={`${rowIdx}-${colIdx}`} cell={cell} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
