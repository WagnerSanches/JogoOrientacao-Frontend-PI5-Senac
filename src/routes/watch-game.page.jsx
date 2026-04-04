import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = "https://pi5-api-production.up.railway.app/api/v1/games/mock-state";

const TEAM1 = ["CLARO", "REY"];
const TEAM2 = ["KARIN", "BEATRIZ"];

function professorColor(professor) {
  if (TEAM1.includes(professor)) return "bg-blue-500 text-white";
  if (TEAM2.includes(professor)) return "bg-red-500 text-white";
  return "";
}

function Cell({ cell }) {
  const hasProfessor = Boolean(cell.professor);
  const baseClass =
    "flex flex-col items-center justify-center rounded border aspect-square text-sm font-medium";
  const colorClass = hasProfessor
    ? professorColor(cell.professor)
    : "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <div className={`${baseClass} ${colorClass}`}>
      <span className="text-xs opacity-70">Nv {cell.level}</span>
      {hasProfessor && <span className="text-xs mt-0.5">{cell.professor}</span>}
    </div>
  );
}

function GameInfo({ game }) {
  const teamLabel = game.turn_team_id === 1 ? "Aliança Turing" : "Lovelace";
  const teamColor = game.turn_team_id === 1 ? "text-blue-600" : "text-red-600";

  return (
    <div className="flex flex-wrap gap-4 mb-6 text-sm">
      <div className="bg-white rounded-lg border px-4 py-2">
        <span className="text-gray-500">Status</span>
        <p className="font-semibold">{game.status}</p>
      </div>
      <div className="bg-white rounded-lg border px-4 py-2">
        <span className="text-gray-500">Turno</span>
        <p className="font-semibold">{game.turn_number}</p>
      </div>
      <div className="bg-white rounded-lg border px-4 py-2">
        <span className="text-gray-500">Time jogando</span>
        <p className={`font-semibold ${teamColor}`}>{teamLabel}</p>
      </div>
      <div className="bg-white rounded-lg border px-4 py-2">
        <span className="text-gray-500">Fase</span>
        <p className="font-semibold">{game.turn_phase}</p>
      </div>
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

  if (loading) return <p className="p-6 text-gray-500">Carregando partida...</p>;
  if (error)
    return (
      <p className="p-6 text-red-600">Erro ao carregar a partida. Tente novamente.</p>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Partida #{id}</h1>

      {game && (
        <>
          <GameInfo game={game} />

          <div className="grid grid-cols-5 gap-1.5">
            {game.board.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <Cell key={`${rowIdx}-${colIdx}`} cell={cell} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
