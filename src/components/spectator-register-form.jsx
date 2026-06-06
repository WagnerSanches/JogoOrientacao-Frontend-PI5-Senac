import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSpectator } from "@/lib/games-api.js";
import { useGameContext } from "@/context/game-context.jsx";
import { spectatorRegisterSchema } from "@/lib/schemas.js";

export function SpectatorRegisterForm({ gameId, onSuccess }) {
  const { setSpectatorForGame } = useGameContext();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(spectatorRegisterSchema),
    defaultValues: {
      spectator_name: "",
      spectator_avatar: "",
    },
  });

  async function onSubmit(data) {
    setApiError(null);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "")
      );
      const response = await registerSpectator(gameId, cleanData);
      console.log("Espectador registrado:", response);
      setSpectatorForGame(gameId, response);
      onSuccess?.(response);
    } catch (err) {
      console.error("Erro ao registrar espectador:", err.status, err.body);
      setApiError(err.message ?? "Erro ao registrar espectador.");
    }
  }

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white";

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👁️</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Antes de assistir, registre-se
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Você precisa se registrar como espectador para acompanhar esta partida
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Seu nome <span className="text-red-500">*</span>
              </label>
              <input
                {...register("spectator_name")}
                placeholder="Como você quer ser chamado"
                autoFocus
                className={inputCls}
              />
              {errors.spectator_name && (
                <p className="text-xs text-red-600 mt-1">{errors.spectator_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                URL do avatar{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                {...register("spectator_avatar")}
                placeholder="https://exemplo.com/avatar.png"
                className={inputCls}
              />
              {errors.spectator_avatar && (
                <p className="text-xs text-red-600 mt-1">{errors.spectator_avatar.message}</p>
              )}
            </div>

            {apiError && <p className="text-sm text-red-600">{apiError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registrando…" : "Assistir Partida"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 font-mono">{gameId}</p>
      </div>
    </div>
  );
}
