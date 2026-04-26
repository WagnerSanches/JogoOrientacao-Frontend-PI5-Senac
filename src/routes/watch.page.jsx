import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

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

function GameCard({ game }) {
  const shortId = game.id?.slice(0, 8) ?? "—";

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
        <Link
          to={`/watch/${game.id}`}
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Assistir →
        </Link>
      </div>
    </div>
  );
}

export default function WatchPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  async function fetchGames(statusFilter) {
    try {
      setError(false);
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/api/v1/games`);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      setGames(Array.isArray(data) ? data : data.games ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGames(activeFilter);
  }, [activeFilter]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Partidas</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Acompanhe as partidas em andamento em tempo real.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
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
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
