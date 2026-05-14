import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import chatApiClient from "@/lib/chatApiClient";
import type { ImportPreview, ImportResult } from "@/types";

export function useImports(meiId: string) {
  return useQuery({
    queryKey: ["imports", meiId],
    queryFn: async () => {
      const { data } = await apiClient.get<ImportResult[]>(
        `/v1/meis/${meiId}/imports`,
      );
      return data;
    },
    enabled: !!meiId,
  });
}

// Step 1 — Upload file directly to FastAPI for LLM classification.
// Nothing is saved to the database yet.
export function usePreviewImport(meiId: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mei_id", meiId);

      // Chama FastAPI diretamente — bypassa o C# e o Supabase
      const { data } = await chatApiClient.post<{
        import_id: string;
        mei_id: string;
        transactions: Array<{
          type: string;
          category: string | null;
          amount: number;
          description: string | null;
          date: string;
        }>;
        products: Array<{
          name: string;
          cost: number | null;
          price: number | null;
          desired_margin: number | null;
        }>;
        employees: Array<{
          name: string;
          contract_type: string | null;
          salary: number | null;
          charges: number | null;
        }>;
        total_rows: number;
        processed_rows: number;
        errors: string[];
        status: string;
      }>("/api/import/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Mapeia snake_case (FastAPI) → camelCase (ImportPreview)
      const preview: ImportPreview = {
        fileUri: "",
        fileName: file.name,
        transactions: data.transactions.map((t) => ({
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description,
          date: t.date,
        })),
        products: data.products.map((p) => ({
          name: p.name,
          cost: p.cost,
          price: p.price,
          desiredMargin: p.desired_margin,
        })),
        employees: data.employees.map((e) => ({
          name: e.name,
          contractType: e.contract_type,
          salary: e.salary,
          charges: e.charges,
        })),
        totalRows: data.total_rows,
        processedRows: data.processed_rows,
        errors: data.errors,
        status: data.status,
      };

      return preview;
    },
  });
}

// Step 2 — User confirmed the preview. Persist everything to the database.
export function useConfirmImport(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (preview: ImportPreview) => {
      const { data } = await apiClient.post<ImportResult>(
        `/v1/meis/${meiId}/imports/confirm`,
        preview,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["imports", meiId] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
