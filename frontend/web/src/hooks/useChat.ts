import { useCallback, useRef, useState } from "react";

import apiClient from "@/lib/apiClient";
import type { ChatMessage } from "@/types";

export function useChat(meiId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Histórico serializado que o C# repassa ao FastAPI por volta.
  const historyRef = useRef<{ role: string; content: string }[]>([]);

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
        // Chama o endpoint de chat do C# que:
        //  1. Valida o JWT e a ownership do MEI
        //  2. Busca o contexto financeiro diretamente do banco de dados
        //  3. Chama o FastAPI com as chaves em snake_case corretas
        //  4. Retorna { reply }
        const { data } = await apiClient.post<{ reply: string }>(
          `/v1/meis/${meiId}/ai/chat`,
          {
            message: trimmed,
            history: historyRef.current,
          },
        );

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
        };

        // Atualiza o histórico em cache para a próxima rodada
        historyRef.current = [
          ...historyRef.current,
          { role: "user", content: trimmed },
          { role: "assistant", content: data.reply },
        ];

        setMessages([...optimisticMessages, assistantMsg]);
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
    historyRef.current = [];
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
