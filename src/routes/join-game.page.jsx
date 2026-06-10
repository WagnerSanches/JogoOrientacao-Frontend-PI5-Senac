import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGame, joinGame } from "@/lib/games-api.js";
import { useGameContext } from "@/context/game-context.jsx";

export default function JoinGamePage() {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const { player } = useGameContext();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGame() {
      try {
        const data = await getGame(gameId);
        setGame(data);

        if (data.turing_player && !data.lovelace_player) {
          setSelectedTeam(2);
        } else if (!data.turing_player && data.lovelace_player) {
          setSelectedTeam(1);
        }
      } catch (err) {
        setError("Erro ao carregar partida");
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [gameId]);

  async function handleJoin() {
    if (!selectedTeam) {
      setError("Selecione um time");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await joinGame(gameId, {
        player_id: player.id,
        team_slot: selectedTeam,
      });
      navigate(`/watch/${gameId}`);
    } catch (err) {
      setError(err.body?.detail || err.message || "Erro ao entrar na partida");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>;
  if (!game) return <div className="text-center py-12 text-gray-400 text-sm">Partida não encontrada</div>;

  const turingTaken = !!game.turing_player;
  const lovelaceTaken = !!game.lovelace_player;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        to="/watch"
        className="inline-block text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        ← Voltar para partidas
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-1">Entrar na Partida</h1>
      <p className="text-gray-400 text-sm font-mono mb-6">{gameId?.slice(0, 8)}…</p>

      <h2 className="font-medium text-gray-700 mb-3">Escolha o seu time:</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Time Turing */}
        <button
          type="button"
          disabled={turingTaken}
          onClick={() => !turingTaken && setSelectedTeam(1)}
          className={`
            relative p-6 rounded-lg border-2 transition text-center
            ${turingTaken
              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              : selectedTeam === 1
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
              : "border-gray-200 hover:border-blue-300 cursor-pointer"}
          `}
        >
          {selectedTeam === 1 && !turingTaken && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              ✓
            </div>
          )}
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500"></div>
          <div className="font-bold text-blue-600">Aliança Turing</div>
          <div className="text-xs text-gray-500 mt-1">Time 1</div>
          {turingTaken && (
            <div className="mt-3 text-xs">
              <div className="text-gray-400 italic">Ocupado por:</div>
              <div className="font-medium text-gray-600">
                {game.turing_player.ai_player_name}
              </div>
            </div>
          )}
        </button>

        {/* Time Lovelace */}
        <button
          type="button"
          disabled={lovelaceTaken}
          onClick={() => !lovelaceTaken && setSelectedTeam(2)}
          className={`
            relative p-6 rounded-lg border-2 transition text-center
            ${lovelaceTaken
              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              : selectedTeam === 2
              ? "border-rose-500 bg-rose-50 ring-2 ring-rose-300"
              : "border-gray-200 hover:border-rose-300 cursor-pointer"}
          `}
        >
          {selectedTeam === 2 && !lovelaceTaken && (
            <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              ✓
            </div>
          )}
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-500"></div>
          <div className="font-bold text-rose-600">Lovelace</div>
          <div className="text-xs text-gray-500 mt-1">Time 2</div>
          {lovelaceTaken && (
            <div className="mt-3 text-xs">
              <div className="text-gray-400 italic">Ocupado por:</div>
              <div className="font-medium text-gray-600">
                {game.lovelace_player.ai_player_name}
              </div>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={!selectedTeam || submitting}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded font-medium transition"
      >
        {submitting ? "Entrando..." : "Confirmar Entrada"}
      </button>
    </div>
  );
}
