import type { AuthSession, LoginRequest, RegisterRequest, User } from "@/types";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER: User = {
  id: "usr_01",
  email: "jordan@technova.com",
  name: "Jordan Doe",
  phone: "+55 (11) 98765-4321",
  created_at: "2024-01-10T00:00:00Z",
};

const MOCK_TOKEN = "mock_access_token_lumemei_2026";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Service ──────────────────────────────────────────────────────────────────
export const authService = {
  async login(data: LoginRequest): Promise<AuthSession> {
    await delay(800);

    if (!data.email || !data.password) {
      throw { message: "E-mail e senha são obrigatórios.", status: 400 };
    }

    // TODO: trocar por chamada real: api.post("/auth/login", data)
    return {
      user: { ...MOCK_USER, email: data.email },
      tokens: { access_token: MOCK_TOKEN, token_type: "bearer" },
    };
  },

  async register(data: RegisterRequest): Promise<AuthSession> {
    await delay(1000);

    if (!data.email || !data.password || !data.name) {
      throw {
        message: "Todos os campos obrigatórios devem ser preenchidos.",
        status: 400,
      };
    }

    // TODO: trocar por chamada real: api.post("/auth/register", data)
    return {
      user: { ...MOCK_USER, email: data.email, name: data.name },
      tokens: { access_token: MOCK_TOKEN, token_type: "bearer" },
    };
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(700);
    // TODO: trocar por chamada real: api.post("/auth/forgot-password", { email })
    console.log("[mock] Reset link sent to:", email);
  },

  async me(): Promise<User> {
    await delay(300);
    // TODO: trocar por chamada real: api.get("/auth/me")
    return MOCK_USER;
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lumemei_token");
      localStorage.removeItem("lumemei_user");
      document.cookie = "lumemei_token=; path=/; max-age=0";
    }
  },
};
