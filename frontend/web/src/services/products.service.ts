import type { Product } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_01",
    mei_id: "mei_01",
    name: "Obsidian Node Alpha",
    cost: 450,
    price: 1250,
    desired_margin: 50,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod_02",
    mei_id: "mei_01",
    name: "Quantum Core Processor",
    cost: 510,
    price: 850,
    desired_margin: 45,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod_03",
    mei_id: "mei_01",
    name: "Legacy Mesh Router",
    cost: 105,
    price: 120,
    desired_margin: 35,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod_04",
    mei_id: "mei_01",
    name: "Aether Firewall License",
    cost: 240,
    price: 2400,
    desired_margin: 80,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const productsService = {
  async getAll(meiId: string): Promise<Product[]> {
    await delay(400);
    // TODO: api.get(`/meis/${meiId}/products`)
    void meiId;
    return MOCK_PRODUCTS;
  },

  async create(
    meiId: string,
    data: Omit<Product, "id" | "mei_id" | "created_at">,
  ): Promise<Product> {
    await delay(500);
    // TODO: api.post(`/meis/${meiId}/products`, data)
    return {
      ...data,
      id: `prod_${Date.now()}`,
      mei_id: meiId,
      created_at: new Date().toISOString(),
    };
  },

  async update(
    meiId: string,
    id: string,
    data: Partial<Product>,
  ): Promise<Product> {
    await delay(400);
    const prod = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!prod) throw { message: "Produto não encontrado.", status: 404 };
    // TODO: api.patch(`/meis/${meiId}/products/${id}`, data)
    return { ...prod, ...data };
  },

  async delete(meiId: string, id: string): Promise<void> {
    await delay(300);
    // TODO: api.delete(`/meis/${meiId}/products/${id}`)
    void meiId;
    void id;
  },
};
