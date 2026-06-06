import { Link } from "react-router-dom";
import { Cell } from "@/components/cell.jsx";

function WinnerBanner({ winnerTeam }) {
  if (!winnerTeam) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl px-6 py-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Resultado
        </p>
        <p className="text-2xl font-bold text-gray-700 mt-1">Empate</p>
      </div>
    );
  }

  const isTuring = winnerTeam === 1;
  const colors = isTuring
    ? "bg-blue-50 border-blue-400 text-blue-700"
    : "bg-rose-50 border-rose-400 text-rose-700";
  const teamName = isTuring ? "Aliança Turing" : "Lovelace";

  return (
    <div className={`border-2 rounded-2xl px-6 py-5 text-center ${colors}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
        🏆 Vencedor
      </p>
      <p className="text-3xl font-bold mt-1">{teamName}</p>
    </div>
  );
}

function PlayerCard({ player, teamName, teamColor, isWinner }) {
  const colorMap = {
    blue: "border-blue-500 bg-blue-50",
    rose: "border-rose-500 bg-rose-50",
  };
  const cardClass = isWinner
    ? `border-2 ${colorMap[teamColor]}`
    : "border border-gray-200 bg-white opacity-60";

  return (
    <div className={`rounded-xl p-4 text-center ${cardClass}`}>
      {player?.ai_player_avatar ? (
        <img
          src={player.ai_player_avatar}
          alt={player.ai_player_name}
          className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white shadow"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-20 h-20 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-3xl">
          🤖
        </div>
      )}
      <p className="mt-3 font-bold text-gray-900 text-sm">
        {player?.ai_player_name || "Sem jogador"}
      </p>
      <p className="text-xs text-gray-500">{player?.group_name || "—"}</p>
      <p
        className={`text-xs font-semibold uppercase mt-2 ${
          teamColor === "blue" ? "text-blue-600" : "text-rose-600"
        }`}
      >
        {teamName}
      </p>
      {isWinner && (
        <p className="text-xs font-bold text-green-700 mt-1">🏆 Venceu</p>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function Board({ board }) {
  if (!board || board.length === 0) {
    return (
      <p className="text-sm text-gray-400">Tabuleiro não disponível.</p>
    );
  }

  const cols = board[0].length;

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {board.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <Cell key={`${rowIdx}-${colIdx}`} cell={cell} />
        ))
      )}
    </div>
  );
}

function calculateDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) return "—";
  const diffMs = new Date(finishedAt) - new Date(startedAt);
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDateTime(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FinishedGameView({ game }) {
  const isTuringWinner = game.winner_team === 1;
  const isLovelaceWinner = game.winner_team === 2;
  const duration = calculateDuration(game.started_at, game.finished_at);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <Link
        to="/watch"
        className="inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Voltar para partidas
      </Link>

      <WinnerBanner winnerTeam={game.winner_team} />

      {/* Confronto dos jogadores */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center bg-white border border-gray-200 rounded-2xl p-6">
        <PlayerCard
          player={game.turing_player}
          teamName="Aliança Turing"
          teamColor="blue"
          isWinner={isTuringWinner}
        />
        <div className="text-2xl font-bold text-gray-300 select-none">VS</div>
        <PlayerCard
          player={game.lovelace_player}
          teamName="Lovelace"
          teamColor="rose"
          isWinner={isLovelaceWinner}
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Turnos" value={game.turn_number ?? "—"} />
        <StatCard label="Duração" value={duration} />
        <StatCard label="Início" value={formatDateTime(game.started_at)} />
        <StatCard label="Fim" value={formatDateTime(game.finished_at)} />
      </div>

      {/* Tabuleiro final */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Tabuleiro Final</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
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
          <Board board={game.board} />
        </div>
      </div>

      <p className="text-xs text-gray-400 font-mono">{game.id}</p>
    </div>
  );
}
