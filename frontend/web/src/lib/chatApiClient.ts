import axios from "axios";

// Cliente axios apontando para a API FastAPI (Python/LLM).
// Não injeta Authorization — o FastAPI não tem auth própria.
// O contexto financeiro é buscado via apiClient (C#) antes de cada chamada.

const _rawFastApiUrl =
  process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

const FASTAPI_BASE_URL = _rawFastApiUrl.startsWith("http")
  ? _rawFastApiUrl
  : `https://${_rawFastApiUrl}`;

const chatApiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default chatApiClient;
