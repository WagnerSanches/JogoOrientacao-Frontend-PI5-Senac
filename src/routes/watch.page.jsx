import { Link } from "react-router-dom";

const EXAMPLE_ID = "00000000-0000-0000-0000-000000000001";

export default function WatchPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Partidas</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Acompanhe as partidas em andamento em tempo real.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              AO VIVO
            </span>
            <span className="text-sm font-medium text-gray-900">
              Partida de exemplo
            </span>
          </div>
          <Link
            to={`/watch/${EXAMPLE_ID}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Assistir →
          </Link>
        </div>
        <div className="px-5 py-3 text-xs text-gray-400">
          ID: {EXAMPLE_ID}
        </div>
      </div>
    </div>
  );
}
