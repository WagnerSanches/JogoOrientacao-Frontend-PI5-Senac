import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/app.layout.jsx";
import HomePage from "@/routes/home.page.jsx";
import WatchPage from "@/routes/watch.page.jsx";
import WatchGamePage from "@/routes/watch-game.page.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/watch/:id" element={<WatchGamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
