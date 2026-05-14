import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
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

// Step 1 — Upload file and get a preview of the extracted data.
// Nothing is saved to the database yet.
export function usePreviewImport(meiId: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await apiClient.post<ImportPreview>(
        `/v1/meis/${meiId}/imports/preview`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
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
