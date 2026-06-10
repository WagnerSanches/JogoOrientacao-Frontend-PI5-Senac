import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useGameContext } from "@/context/game-context.jsx";
import { clearSpectatorProfile, getSpectatorProfile } from "@/components/spectator-register-form.jsx";

export default function AppLayout() {
  const navigate = useNavigate();
  const { player, logout } = useGameContext();
  const playerName = player?.ai_player_name ?? (player?.id ? `Jogador #${player.id}` : null);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function handleClearSpectatorProfile() {
    clearSpectatorProfile();
    alert("Perfil de espectador removido. Será pedido o nome novamente.");
  }

  const spectatorProfile = getSpectatorProfile();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 tracking-tight">
            🎓 Jogo da Orientação
          </span>
          <div className="flex items-center gap-3">
            <NavLink
              to="/watch"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              Partidas
            </NavLink>
            {playerName && (
              <span className="text-sm text-gray-500 hidden sm:block">{playerName}</span>
            )}
            {spectatorProfile?.name && (
              <button
                onClick={handleClearSpectatorProfile}
                title={`Espectador: ${spectatorProfile.name}`}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors hidden sm:block"
              >
                👁️ {spectatorProfile.name}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
