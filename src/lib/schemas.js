import { z } from "zod";

export const playerRegisterSchema = z.object({
  group_name: z.string().min(1, "O nome do grupo é obrigatório"),
  ai_player_name: z.string().min(1, "O nome do jogador é obrigatório"),
  ai_player_avatar: z
    .string()
    .url("Deve ser uma URL válida")
    .or(z.literal(""))
    .optional(),
  ai_player_description: z.string().optional(),
  ai_player_move_endpoint: z
    .string()
    .url("Deve ser uma URL válida")
    .or(z.literal(""))
    .optional(),
});

export const tokenLoginSchema = z.object({
  token: z.string().min(1, "O token é obrigatório"),
  player_id: z.coerce
    .number()
    .int()
    .positive("O ID do jogador é obrigatório"),
});

export const gameCreateSchema = z.object({
  team_slot: z.enum(["1", "2"], {
    errorMap: () => ({ message: "Selecione um time" }),
  }),
  vs_random_bot: z.boolean(),
  auto_start: z.boolean(),
});

export const spectatorRegisterSchema = z.object({
  spectator_name: z.string().min(1, "O nome do espectador é obrigatório"),
  spectator_avatar: z
    .string()
    .url("Deve ser uma URL válida")
    .or(z.literal(""))
    .optional(),
});
