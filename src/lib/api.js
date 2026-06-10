const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "[api.js] VITE_API_BASE_URL não está configurada. " +
    "Crie o arquivo .env na raiz do projeto com: VITE_API_BASE_URL=https://...\n" +
    "Atenção: no PowerShell, use Set-Content ao invés de '>' para evitar UTF-16."
  );
}

function getAccessToken() {
  try {
    const player = JSON.parse(localStorage.getItem("player") || "null");
    return player?.player_access_token || null;
  } catch {
    return null;
  }
}

/**
 * Cliente HTTP central da aplicação.
 *
 * @param {string} path - Caminho do endpoint, sem o prefixo /api/v1 (ex: '/games', '/players/1')
 * @param {object} options
 * @param {string} options.method - GET, POST, PUT, DELETE
 * @param {object} options.body - Body da requisição (será serializado como JSON)
 * @param {object} options.query - Query params (valores vazios/null/undefined são ignorados)
 * @param {object} options.headers - Headers extras
 * @param {string} options.token - Token customizado (sobrescreve o do localStorage)
 */
export async function apiClient(path, options = {}) {
  const { body, query, headers = {}, token, ...rest } = options;

  const cleanPath = path.replace(/^\//, "");
  const url = new URL(`api/v1/${cleanPath}`, API_BASE_URL);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const accessToken = token ?? getAccessToken();

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(url.toString(), {
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error = new Error(errorBody?.detail || `HTTP ${response.status}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}
