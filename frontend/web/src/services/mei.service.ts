import type { Mei } from "@/types";

const MOCK_MEIS: Mei[] = [
  {
    id: "mei_01",
    user_id: "usr_01",
    name: "TechNova Solutions",
    cnpj: "42.891.002/0001-90",
    cnae: "6201-5/00",
    annual_limit: 81000,
    plan: "pro",
    created_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "mei_02",
    user_id: "usr_01",
    name: "Studio Arc",
    cnpj: "12.345.678/0001-90",
    cnae: "7410-2/02",
    annual_limit: 81000,
    plan: "starter",
    created_at: "2024-06-01T00:00:00Z",
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const meiService = {
  async getAll(): Promise<Mei[]> {
    await delay(300);
    // TODO: api.get("/meis")
    return MOCK_MEIS;
  },

  async getById(id: string): Promise<Mei> {
    await delay(200);
    const mei = MOCK_MEIS.find((m) => m.id === id);
    if (!mei) throw { message: "MEI não encontrado.", status: 404 };
    // TODO: api.get(`/meis/${id}`)
    return mei;
  },

  async create(data: Omit<Mei, "id" | "user_id" | "created_at">): Promise<Mei> {
    await delay(500);
    // TODO: api.post("/meis", data)
    return {
      ...data,
      id: `mei_${Date.now()}`,
      user_id: "usr_01",
      created_at: new Date().toISOString(),
    };
  },

  async update(id: string, data: Partial<Mei>): Promise<Mei> {
    await delay(400);
    const mei = MOCK_MEIS.find((m) => m.id === id);
    if (!mei) throw { message: "MEI não encontrado.", status: 404 };
    // TODO: api.patch(`/meis/${id}`, data)
    return { ...mei, ...data };
  },
};
