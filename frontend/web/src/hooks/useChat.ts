import { useCallback, useState } from "react";

import apiClient from "@/lib/apiClient";
import type { ChatMessage } from "@/types";

export function useChat(meiId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const { data } = await apiClient.post<{ reply: string }>(
          `/v1/meis/${meiId}/ai/chat`,
          { message: trimmed, history },
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
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
