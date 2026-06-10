import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listGames } from "@/lib/games-api.js";
import { useGameContext } from "@/context/game-context.jsx";

const STATUS_LABELS = {
  WAITING_PLAYERS: "Aguardando Jogadores",
  PLAYING: "Em Andamento",
  PAUSED: "Pausado",
  FINISHED: "Finalizado",
};

const STATUS_BADGE = {
  WAITING_PLAYERS: "bg-yellow-100 text-yellow-800",
  PLAYING: "bg-green-100 text-green-800",
  PAUSED: "bg-orange-100 text-orange-800",
  FINISHED: "bg-gray-100 text-gray-600",
};

const FILTERS = [
  { label: "Todas", value: "" },
  { label: "Ao vivo", value: "PLAYING" },
  { label: "Aguardando", value: "WAITING_PLAYERS" },
  { label: "Finalizadas", value: "FINISHED" },
];

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status;
  const cls = STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function GameCard({ game, player }) {
  const shortId = game.id?.slice(0, 8) ?? "—";
  const canJoin =
    game.status === "WAITING_PLAYERS" &&
    player?.id &&
    player.id !== game.created_by;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={game.status} />
            <span className="text-xs text-gray-400 font-mono">{shortId}…</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mt-1">
            Aliança Turing{" "}
            <span className="text-gray-400 font-normal">vs</span>{" "}
            Lovelace
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canJoin && (
            <Link
              to={`/games/${game.id}/join`}
              className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Entrar como Jogador
            </Link>
          )}
          <Link
            to={`/watch/${game.id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {game.status === "FINISHED" ? "Ver Detalhes" : "Assistir"} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  const { player } = useGameContext();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [onlyMyGames, setOnlyMyGames] = useState(
    () => localStorage.getItem("only_my_games") === "true"
  );

  useEffect(() => {
    localStorage.setItem("only_my_games", String(onlyMyGames));
  }, [onlyMyGames]);

  async function fetchGames(statusFilter, myGames) {
    try {
      setError(false);
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (myGames && player?.id) filters.player_id = player.id;
      const data = await listGames(filters);
      console.log("Resposta da API:", data);
      console.log("Items:", data?.items);
      if (data?.items?.length > 0) {
        console.log("Primeiro item:", data.items[0]);
        console.log("Campos disponíveis:", Object.keys(data.items[0]));
      }
      setGames(data?.items ?? []);
    } catch (err) {
      console.error("Erro ao carregar partidas:", err.status, err.body);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGames(activeFilter, onlyMyGames);
  }, [activeFilter, onlyMyGames]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partidas</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Acompanhe as partidas em andamento em tempo real.
          </p>
        </div>
        <Link
          to="/games/new"
          className="shrink-0 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          + Criar Partida
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
        {player?.id && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 ml-2 select-none">
            <input
              type="checkbox"
              checked={onlyMyGames}
              onChange={(e) => setOnlyMyGames(e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            Apenas minhas partidas
          </label>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Carregando partidas...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-rose-600 font-medium">Erro ao carregar as partidas.</p>
          <button
            onClick={() => fetchGames(activeFilter)}
            className="text-sm text-blue-600 hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <p className="text-center text-gray-400 py-20 text-sm">Nenhuma partida encontrada.</p>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
