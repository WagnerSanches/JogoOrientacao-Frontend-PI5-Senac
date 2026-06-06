import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerPlayer } from "@/lib/games-api.js";
import { useGameContext } from "@/context/game-context.jsx";
import { playerRegisterSchema, tokenLoginSchema } from "@/lib/schemas.js";

const inputCls =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white";

function PlayerRegisterForm() {
  const { setPlayer } = useGameContext();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(playerRegisterSchema),
    defaultValues: {
      group_name: "",
      ai_player_name: "",
      ai_player_avatar: "",
      ai_player_description: "",
      ai_player_move_endpoint: "",
    },
  });

  async function onSubmit(data) {
    setApiError(null);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "")
      );
      const response = await registerPlayer(cleanData);
      setPlayer(response);
      navigate("/watch");
    } catch (err) {
      console.error("Erro ao cadastrar jogador:", err.status, err.body);
      setApiError(
        err.message || "Erro ao cadastrar jogador. Verifique os dados e tente novamente."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <input
          {...register("group_name")}
          placeholder="Nome do grupo *"
          autoComplete="off"
          className={inputCls}
        />
        {errors.group_name && (
          <p className="text-xs text-red-600 mt-1">{errors.group_name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("ai_player_name")}
          placeholder="Nome do jogador *"
          autoComplete="off"
          className={inputCls}
        />
        {errors.ai_player_name && (
          <p className="text-xs text-red-600 mt-1">{errors.ai_player_name.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("ai_player_avatar")}
          placeholder="URL do avatar"
          autoComplete="off"
          className={inputCls}
        />
        {errors.ai_player_avatar && (
          <p className="text-xs text-red-600 mt-1">{errors.ai_player_avatar.message}</p>
        )}
      </div>

      <input
        {...register("ai_player_description")}
        placeholder="Descrição"
        autoComplete="off"
        className={inputCls}
      />

      <div>
        <input
          {...register("ai_player_move_endpoint")}
          placeholder="https://sua-api.com/move"
          autoComplete="off"
          className={inputCls}
        />
        {errors.ai_player_move_endpoint && (
          <p className="text-xs text-red-600 mt-1">{errors.ai_player_move_endpoint.message}</p>
        )}
      </div>

      {apiError && <p className="text-sm text-red-600">{apiError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Cadastrando…" : "Cadastrar"}
      </button>
    </form>
  );
}

function TokenLoginForm() {
  const { setPlayer } = useGameContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tokenLoginSchema),
    defaultValues: { token: "", player_id: "" },
  });

  function onSubmit(data) {
    setPlayer({ id: data.player_id, player_access_token: data.token.trim() });
    navigate("/watch");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Token <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("token")}
          placeholder="Cole seu token aqui"
          rows={5}
          className={`${inputCls} resize-none font-mono text-xs`}
        />
        {errors.token && (
          <p className="text-xs text-red-600 mt-1">{errors.token.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          ID do jogador <span className="text-red-500">*</span>
        </label>
        <input
          {...register("player_id")}
          type="number"
          placeholder="Ex: 42"
          className={inputCls}
        />
        {errors.player_id && (
          <p className="text-xs text-red-600 mt-1">{errors.player_id.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="mt-1 w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        Entrar
      </button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            🎓 Jogo da Orientação — PI5
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Cadastre seu jogador ou entre com um token existente
          </p>
        </div>

        <div className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Painel esquerdo — Novo Jogador */}
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Novo Jogador</h2>
            <PlayerRegisterForm />
          </div>

          {/* Painel direito — Já tenho cadastro */}
          <div className="flex-1 p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Já tenho cadastro</h2>
            <TokenLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
