import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div>
      <nav>
        <NavLink to="/">Início</NavLink>
        <NavLink to="/watch">Partidas</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
