import type { Import } from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_IMPORTS: Import[] = [
  {
    id: "imp_8924",
    mei_id: "mei_01",
    file_url: "/uploads/Q3_Transaction_Log.csv",
    status: "processing",
    total_rows: 1200,
    processed_rows: 540,
    created_at: new Date().toISOString(),
  },
  {
    id: "imp_8923",
    mei_id: "mei_01",
    file_url: "/uploads/EMEA_Product_Matrix_v2.xlsx",
    status: "pending",
    total_rows: 88,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "imp_8921",
    mei_id: "mei_01",
    file_url: "/uploads/Historical_Ledger_2022.csv",
    status: "completed",
    total_rows: 1200000,
    processed_rows: 1200000,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "imp_8919",
    mei_id: "mei_01",
    file_url: "/uploads/Corrupted_Data_Dump.json",
    status: "failed",
    errors: { reason: "Schema Validation Failed" },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const importsService = {
  async getAll(meiId: string): Promise<Import[]> {
    await delay(400);
    // TODO: api.get(`/meis/${meiId}/imports`)
    void meiId;
    return MOCK_IMPORTS;
  },

  async upload(meiId: string, file: File): Promise<Import> {
    await delay(1500);
    // TODO: multipart upload via api.post(`/meis/${meiId}/imports`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    return {
      id: `imp_${Date.now()}`,
      mei_id: meiId,
      file_url: `/uploads/${file.name}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };
  },

  async getStatus(meiId: string, importId: string): Promise<Import> {
    await delay(200);
    // TODO: api.get(`/meis/${meiId}/imports/${importId}`)
    const imp = MOCK_IMPORTS.find((i) => i.id === importId);
    if (!imp) throw { message: "Importação não encontrada.", status: 404 };
    return imp;
  },
};
