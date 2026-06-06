import { Navigate, Outlet } from "react-router-dom";
import { useGameContext } from "@/context/game-context.jsx";

export function AuthGuard() {
  const { isAuthenticated } = useGameContext();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
