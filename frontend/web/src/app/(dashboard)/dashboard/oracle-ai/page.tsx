"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Brain, TrendingUp, PieChart } from "lucide-react";
import { aiService, type ChatMessage } from "@/services/ai.service";
import { useMeiContext } from "@/context";
import { cn } from "@/lib/cn";

const SUGGESTED_PROMPTS = [
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Am I making a profit?",
    desc: "Analyze Q3 revenue vs operational costs.",
  },
  {
    icon: <PieChart className="w-4 h-4" />,
    title: "Where am I spending most?",
    desc: "Breakdown expenses by vendor category.",
  },
];

export default function OracleAIPage() {
  const { activeMei } = useMeiContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeMei) return;
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const reply = await aiService.sendMessage(activeMei.id, text);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] animate-fade-in">
      {/* Header */}
      <div className="pb-4">
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          Oracle AI
        </h1>
        <p className="text-on-muted text-sm mt-1">
          Your financial intelligence core.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-accent" />
            </div>
            <p className="text-on-surface font-semibold text-lg mb-2">
              Oracle Advisor
            </p>
            <p className="text-on-muted text-sm max-w-md mb-8">
              Your financial intelligence core. Ask me to analyze trends,
              generate reports, or identify anomalies in your ledger.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.title}
                  onClick={() => sendMessage(prompt.title)}
                  className="flex items-start gap-3 p-4 bg-obsidian-card rounded-card border border-obsidian-elevated hover:border-accent/40 transition-colors text-left"
                >
                  <span className="text-accent mt-0.5">{prompt.icon}</span>
                  <div>
                    <p className="text-on-surface font-semibold text-sm">
                      {prompt.title}
                    </p>
                    <p className="text-on-muted text-xs mt-0.5">
                      {prompt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-4 max-w-lg">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-obsidian-elevated pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 bg-obsidian-card rounded-xl border border-obsidian-elevated px-4 py-3"
        >
          <button
            type="button"
            className="text-on-muted hover:text-on-surface transition-colors shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Oracle to analyze data, find transactions..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-muted/60 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white hover:bg-accent-muted transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-on-muted/50 text-xs mt-2">
          Oracle AI can make mistakes. Consider verifying critical financial
          figures.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-accent" />
        </div>
      )}
      <div
        className={cn(
          "rounded-card px-4 py-3 max-w-lg text-sm leading-relaxed",
          isUser
            ? "bg-accent/20 border border-accent/30 text-on-surface ml-auto"
            : "bg-obsidian-card border border-obsidian-elevated text-on-surface",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
