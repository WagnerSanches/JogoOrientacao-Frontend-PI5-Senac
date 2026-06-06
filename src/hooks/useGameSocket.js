import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function resolveWebSocketURL(url) {
  return url.replace(/^https?:/, (match) => (match === "https:" ? "wss:" : "ws:"));
}

export function useGameSocket(gameId, spectatorToken) {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);

  const webSocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!gameId || !spectatorToken) return;

    function connect() {
      const url = new URL(`api/v1/ws/games/${gameId}`, API_BASE_URL);
      url.searchParams.set("token", spectatorToken);
      const socketUrl = resolveWebSocketURL(url.toString());

      console.log("Conectando WebSocket:", socketUrl);

      const ws = new WebSocket(socketUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket conectado");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Estado recebido:", data);
          setGameState(data);
        } catch (err) {
          console.error("Erro ao parsear mensagem do WebSocket:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket desconectado, tentando reconectar em 2s...");
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (gameId) connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.error("Erro no WebSocket:", err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (webSocketRef.current) {
        webSocketRef.current.onclose = null;
        webSocketRef.current.close();
      }
    };
  }, [gameId, spectatorToken]);

  return { connected, gameState };
}
