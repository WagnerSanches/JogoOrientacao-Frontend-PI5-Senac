import { apiClient } from "./api.js";

// ===== Players =====

export function registerPlayer(dto) {
  return apiClient("/players", { method: "POST", body: dto });
}

export function listPlayers() {
  return apiClient("/players", { method: "GET" });
}

export function updatePlayerEndpoint(playerId, dto) {
  return apiClient(`/players/${playerId}`, { method: "PUT", body: dto });
}

// ===== Games =====

export function listGames(filters = {}) {
  return apiClient("/games", { method: "GET", query: filters });
}

export function getGame(gameId) {
  return apiClient(`/games/${gameId}`, { method: "GET" });
}

export function createGame(dto) {
  return apiClient("/games", { method: "POST", body: dto });
}

export function startGame(gameId, dto = {}) {
  return apiClient(`/games/${gameId}/start`, { method: "POST", body: dto });
}

export function joinGame(gameId, dto) {
  return apiClient(`/games/${gameId}/join`, { method: "POST", body: dto });
}

export function stopGame(gameId, dto = {}) {
  return apiClient(`/games/${gameId}/stop`, { method: "POST", body: dto });
}

// ===== Spectators =====

export function registerSpectator(gameId, dto) {
  return apiClient(`/games/${gameId}/spectators`, { method: "POST", body: dto });
}

// ===== Mock (testes) =====

export function getMockState(dto) {
  return apiClient("/games/mock-state", { method: "POST", body: dto });
}
