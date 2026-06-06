import { createContext, useContext, useEffect, useState } from "react";

const GameContext = createContext({});

const STORAGE_KEYS = {
  PLAYER: "player",
  SPECTATORS: "spectators",
};

function readFromStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function GameContextProvider({ children }) {
  const [player, setPlayerState] = useState(() => readFromStorage(STORAGE_KEYS.PLAYER));
  const [spectators, setSpectatorsState] = useState(
    () => readFromStorage(STORAGE_KEYS.SPECTATORS) || {}
  );

  // ===== PLAYER =====

  function setPlayer(playerData) {
    setPlayerState(playerData);
  }

  function logout() {
    setPlayerState(null);
    setSpectatorsState({});
  }

  // ===== SPECTATORS (objeto indexado por gameId) =====

  function setSpectatorForGame(gameId, spectatorData) {
    setSpectatorsState((prev) => ({ ...prev, [gameId]: spectatorData }));
  }

  function getSpectatorForGame(gameId) {
    return spectators[gameId] || null;
  }

  function getSpectatorToken(gameId) {
    return spectators[gameId]?.spectator_access_token || null;
  }

  // ===== Persistência automática no localStorage =====

  useEffect(() => {
    if (player) {
      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PLAYER);
      localStorage.removeItem("player_access_token");
      localStorage.removeItem("player_id");
    }
  }, [player]);

  useEffect(() => {
    if (Object.keys(spectators).length > 0) {
      localStorage.setItem(STORAGE_KEYS.SPECTATORS, JSON.stringify(spectators));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SPECTATORS);
    }
  }, [spectators]);

  // ===== Helpers derivados =====

  const isAuthenticated = !!player?.player_access_token;
  const playerToken = player?.player_access_token || null;

  const value = {
    player,
    setPlayer,
    logout,
    isAuthenticated,
    playerToken,
    spectators,
    setSpectatorForGame,
    getSpectatorForGame,
    getSpectatorToken,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext deve ser usado dentro de um GameContextProvider");
  }
  return context;
}
