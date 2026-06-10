import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/app.layout.jsx";
import AuthPage from "@/routes/auth.page.jsx";
import WatchPage from "@/routes/watch.page.jsx";
import WatchGamePage from "@/routes/watch-game.page.jsx";
import CreateGamePage from "@/routes/create-game.page.jsx";
import JoinGamePage from "@/routes/join-game.page.jsx";
import { AuthGuard } from "@/components/auth-guard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/watch/:id" element={<WatchGamePage />} />
            <Route path="/games/new" element={<CreateGamePage />} />
            <Route path="/games/:id/join" element={<JoinGamePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
