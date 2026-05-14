import { useCallback, useRef, useState } from "react";

import apiClient from "@/lib/apiClient";
import chatApiClient from "@/lib/chatApiClient";
import type { ChatMessage } from "@/types";

export function useChat(meiId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache do contexto financeiro por MEI.
  // Buscado uma vez do C# e reutilizado em todas as mensagens da sessão.
  const contextRef = useRef<Record<string, unknown> | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !meiId) return;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const optimisticMessages = [...messages, userMsg];
      setMessages(optimisticMessages);
      setIsLoading(true);
      setError(null);

      try {
        // 1. Busca o contexto financeiro no C# (apenas na primeira mensagem)
        if (!contextRef.current) {
          const { data: ctx } = await apiClient.get<Record<string, unknown>>(
            `/v1/meis/${meiId}/ai/context`,
          );
          contextRef.current = ctx;
        }

        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // 2. Chama o FastAPI diretamente — sem passar pelo C#
        const { data } = await chatApiClient.post<{ reply: string }>(
          "/api/chat/message",
          {
            mei_id: meiId,
            message: trimmed,
            history,
            context: contextRef.current,
          },
        );

        setMessages([
          ...optimisticMessages,
          { role: "assistant", content: data.reply },
        ]);
      } catch {
        setError("Falha ao obter resposta. Tente novamente.");
        // Rollback the optimistic user message on error
        setMessages(messages);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, meiId],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    contextRef.current = null; // limpa cache ao reiniciar a conversa
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
