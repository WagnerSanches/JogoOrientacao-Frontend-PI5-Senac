import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { gameCreateSchema } from "@/lib/schemas.js";
import { createGame } from "@/lib/games-api.js";
import { useGameContext } from "@/context/game-context.jsx";

export default function CreateGamePage() {
  const { player } = useGameContext();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(gameCreateSchema),
    defaultValues: {
      team_slot: undefined,
      vs_random_bot: true,
      auto_start: true,
    },
  });

  const selectedTeam = watch("team_slot");
  const vsRandomBot = watch("vs_random_bot");
  const autoStart = watch("auto_start");

  async function onSubmit(data) {
    console.log("Player no context:", player);
    console.log("Player ID:", player?.id);
    console.log("Token:", player?.player_access_token);
    setApiError(null);
    if (!player?.id) {
      setApiError("ID do jogador não encontrado. Faça login novamente.");
      return;
    }
    try {
      const payload = {
        player_id: player.id,
        team_slot: Number(data.team_slot),
        vs_random_bot: data.vs_random_bot,
        auto_start: data.auto_start,
      };
      console.log("Criando partida:", payload);
      const response = await createGame(payload);
      console.log("Partida criada:", response);
      navigate(`/watch/${response.id}`);
    } catch (err) {
      console.error("Erro ao criar partida:", err.status, err.body);
      setApiError(err.message || "Erro ao criar partida. Tente novamente.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          to="/watch"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Voltar para partidas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">Nova Partida</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Configure e inicie uma nova partida.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-6"
      >
        {/* Seleção de time */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Escolha seu time
          </p>
          <Controller
            name="team_slot"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange("1")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    field.value === "1"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-blue-700 text-sm">Aliança Turing</p>
                  <p className="text-xs text-gray-500 mt-1">CLARO e REY</p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("2")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    field.value === "2"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-rose-700 text-sm">Lovelace</p>
                  <p className="text-xs text-gray-500 mt-1">KARIN e BEATRIZ</p>
                </button>
              </div>
            )}
          />
          {errors.team_slot && (
            <>
              {console.log(errors.team_slot.message)}
              <p className="text-xs text-red-600 mt-1.5">{errors.team_slot.message}</p>
            </>
          )}
        </div>

        {/* Oponente */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">Oponente</p>
          <Controller
            name="vs_random_bot"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    field.value === true
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">Bot Aleatório</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Jogar contra o bot do professor
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    field.value === false
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">Aguardar jogador</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Partida aberta esperando outro grupo
                  </p>
                </button>
              </div>
            )}
          />
        </div>

        {/* Auto start */}
        <div>
          <Controller
            name="auto_start"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-gray-900"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Iniciar automaticamente
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Se desligado, a partida fica pausada até você dar start manualmente
                  </p>
                </div>
              </label>
            )}
          />
        </div>

        {/* Resumo */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-gray-700 mb-2">Resumo</p>
          <div className="flex flex-col gap-1 text-gray-600">
            <span>
              Time:{" "}
              <span className="font-medium text-gray-900">
                {selectedTeam === "1"
                  ? "Aliança Turing"
                  : selectedTeam === "2"
                  ? "Lovelace"
                  : "—"}
              </span>
            </span>
            <span>
              Oponente:{" "}
              <span className="font-medium text-gray-900">
                {vsRandomBot ? "Bot Aleatório" : "Aguardar jogador"}
              </span>
            </span>
            <span>
              Início:{" "}
              <span className="font-medium text-gray-900">
                {autoStart ? "Automático" : "Manual"}
              </span>
            </span>
          </div>
        </div>

        {apiError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedTeam}
          className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Criando partida…" : "Criar Partida"}
        </button>
      </form>
    </div>
  );
}
