import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./app.jsx";
import { GameContextProvider } from "@/context/game-context.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GameContextProvider>
      <App />
    </GameContextProvider>
  </StrictMode>
);
