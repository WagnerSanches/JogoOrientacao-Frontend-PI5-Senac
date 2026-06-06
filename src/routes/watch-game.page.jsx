import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGameSocket } from "@/hooks/useGameSocket.js";
import { SpectatorRegisterForm } from "@/components/spectator-register-form.jsx";
import { FinishedGameView } from "@/components/finished-game-view.jsx";
import { Cell } from "@/components/cell.jsx";
import { useGameContext } from "@/context/game-context.jsx";
import { getGame } from "@/lib/games-api.js";

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
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getSpectatorToken } = useGameContext();
  const spectatorToken = getSpectatorToken(gameId);

  // Don't open a WebSocket for finished games
  const effectiveSpectatorToken =
    game?.status === "FINISHED" ? null : spectatorToken;
  const { connected, gameState } = useGameSocket(gameId, effectiveSpectatorToken);
  const displayGame = gameState ?? game;

  async function fetchGame() {
    try {
      setError(null);
      setLoading(true);
      const data = await getGame(gameId);
      console.log("Dados da partida:", data);
      setGame(data);
    } catch (err) {
      console.error("Erro ao carregar partida:", err.status, err.body);
      if (err.status === 401) setError("Token inválido ou expirado.");
      else if (err.status === 404) setError("Partida não encontrada.");
      else setError(err.message ?? "Erro ao carregar a partida.");
    } finally {
      setLoading(false);
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

  if (game?.status === "FINISHED") return <FinishedGameView game={game} />;

  if (!spectatorToken)
    return <SpectatorRegisterForm gameId={gameId} onSuccess={() => {}} />;

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
