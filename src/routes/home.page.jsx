import { Link } from "react-router-dom";

const EXAMPLE_ID = "00000000-0000-0000-0000-000000000001";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Jogo da Orientação
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">
          Jogo de tabuleiro acadêmico do PI5 Senac. Dois times disputam para
          orientar os alunos até o TCC.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg mb-3">
            ⚔️
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Aliança Turing</h2>
          <p className="text-sm text-gray-500">Professores Rei e Claro</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-lg mb-3">
            ⚔️
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Lovelace</h2>
          <p className="text-sm text-gray-500">Professores Karen e Bia</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/watch"
          className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Ver partidas
        </Link>
        <Link
          to={`/watch/${EXAMPLE_ID}`}
          className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Partida de exemplo
        </Link>
      </div>
    </div>
  );
}
