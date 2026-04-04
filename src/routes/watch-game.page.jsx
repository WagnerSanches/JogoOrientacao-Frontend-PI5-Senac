import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = "https://pi5-api-production.up.railway.app/api/v1/games/mock-state";

const TEAM1 = ["CLARO", "REY"];
const TEAM2 = ["KARIN", "BEATRIZ"];

const LEVEL_LABELS = {
  0: "CALOURO",
  1: "1º ANO",
  2: "2º ANO",
  3: "3º ANO",
  4: "4º ANO",
};

function Cell({ cell }) {
  const hasProfessor = Boolean(cell.professor);
  const isTeam1 = TEAM1.includes(cell.professor);
  const isTeam2 = TEAM2.includes(cell.professor);

  const cellBg = isTeam1
    ? "bg-blue-400 border-blue-500 shadow-blue-100"
    : isTeam2
    ? "bg-rose-400 border-rose-500 shadow-rose-100"
    : "bg-white border-gray-200";

  const levelColor = hasProfessor ? "text-white/80" : "text-gray-400";

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 aspect-square shadow-sm transition-all ${cellBg}`}
    >
      <span className={`text-[10px] font-semibold tracking-wide uppercase ${levelColor}`}>
        {LEVEL_LABELS[cell.level] ?? `Nv ${cell.level}`}
      </span>
      {hasProfessor && (
        <span className="mt-1 px-2 py-0.5 bg-white/20 rounded-full text-white text-[11px] font-bold tracking-wide">
          {cell.professor}
        </span>
      )}
    </div>
  );
}

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

function GameInfo({ game }) {
  const teamLabel = game.turn_team_id === 1 ? "Aliança Turing" : "Lovelace";
  const teamAccent = game.turn_team_id === 1 ? "text-blue-600" : "text-rose-600";
  const phaseLabel =
    game.turn_phase === "positioning" ? "Posicionamento" : "Turno do jogador";

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <InfoBadge
        label="Status"
        value={game.status}
        accent="text-green-600"
      />
      <InfoBadge label="Turno" value={`#${game.turn_number}`} />
      <InfoBadge label="Time jogando" value={teamLabel} accent={teamAccent} />
      <InfoBadge label="Fase" value={phaseLabel} />
    </div>
  );
}

export default function WatchGamePage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function fetchGame() {
    try {
      setError(false);
      setLoading(true);
      const response = await fetch(API_URL, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      const data = await response.json();
      setGame(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetchGame();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 gap-2">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm">Carregando partida...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2">
        <p className="text-rose-600 font-medium">Erro ao carregar a partida.</p>
        <p className="text-sm text-gray-400">Tente novamente mais tarde.</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partida</h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">{id}</p>
      </div>

      {game && (
        <>
          <GameInfo game={game} />

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
              {game.board.map((row, rowIdx) =>
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
