"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { useMeiContext } from "@/contexts/MeiContext";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage } from "@/types";

const SUGGESTED_PROMPTS = [
  {
    icon: "trending_up",
    title: "Estou tendo lucro?",
    desc: "Analise receitas e despesas do meu MEI.",
  },
  {
    icon: "donut_large",
    title: "Onde gasto mais?",
    desc: "Mostre as principais categorias de despesas.",
  },
  {
    icon: "receipt_long",
    title: "Quanto faturei?",
    desc: "Resumo do faturamento e limite anual MEI.",
  },
  {
    icon: "balance",
    title: "Obrigações do MEI",
    desc: "Quais são as obrigações fiscais do MEI?",
  },
];

function makeAnimatedComponents(animate: boolean) {
  let idx = 0;
  const delay = (base: number) =>
    animate
      ? { animation: `aiMsgFade 0.35s ease-out ${base * idx++ * 0.07}s both` }
      : {};

  return {
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-2 last:mb-0" style={delay(1)}>
        {children}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-4 mb-2 space-y-0.5" style={delay(1)}>
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-4 mb-2 space-y-0.5" style={delay(1)}>
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li style={delay(0.6)}>{children}</li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-on-surface">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="bg-surface-container-highest px-1 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="font-headline font-bold text-base mb-2" style={delay(1)}>
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        className="font-headline font-semibold text-sm mb-1.5"
        style={delay(1)}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-headline font-semibold text-sm mb-1" style={delay(1)}>
        {children}
      </h3>
    ),
  };
}

function MessageBubble({
  msg,
  isLatest,
}: {
  msg: ChatMessage;
  isLatest?: boolean;
}) {
  const isUser = msg.role === "user";
  const components = isUser ? undefined : makeAnimatedComponents(!!isLatest);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mr-3 shrink-0 mt-0.5">
          <span
            className="material-symbols-outlined text-primary-container text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "prism-gradient text-[#002979] rounded-br-sm whitespace-pre-wrap"
            : "bg-surface-container text-on-surface border border-outline-variant/10 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          msg.content
        ) : (
          <ReactMarkdown components={components as never}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mr-3 shrink-0">
        <span
          className="material-symbols-outlined text-primary-container text-base"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          psychology
        </span>
      </div>
      <div className="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function LumemeiAIPage() {
  const { activeMei } = useMeiContext();
  const meiId = activeMei?.id ?? "";
  const { messages, isLoading, error, sendMessage } = useChat(meiId);

  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (title: string) => {
    setInputValue(title);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)]">
      {/* Header */}
      <div className="pb-4">
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          LUMEMEI AI
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Seu assistente financeiro inteligente.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-4">
              <span
                className="material-symbols-outlined text-primary-container text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <p className="text-on-surface font-headline font-semibold text-lg mb-2">
              LUMEMEI Advisor
            </p>
            <p className="text-on-surface-variant text-sm max-w-md mb-10 leading-relaxed">
              Seu núcleo de inteligência financeira. Pergunte sobre tendências,
              obrigações do MEI ou análise de gastos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.title}
                  onClick={() => handleSuggestedPrompt(prompt.title)}
                  className="text-left p-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                      {prompt.icon}
                    </span>
                    <p className="font-headline font-semibold text-on-surface text-sm">
                      {prompt.title}
                    </p>
                  </div>
                  <p className="text-on-surface-variant text-xs">
                    {prompt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 px-1">
            {messages.map((msg, i) => {
              const isLatest =
                msg.role === "assistant" &&
                i === messages.findLastIndex((m) => m.role === "assistant");
              return <MessageBubble key={i} msg={msg} isLatest={isLatest} />;
            })}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Chat Input */}
      <div className="pt-4 border-t border-outline-variant/10">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !meiId}
              placeholder={
                !meiId
                  ? "Selecione um MEI para começar..."
                  : "Pergunte ao LUMEMEI AI..."
              }
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/10 focus:border-primary/30 focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim() || !meiId}
            className="p-3 rounded-xl prism-gradient text-[#002979] shrink-0 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xl">
              {isLoading ? "hourglass_empty" : "send"}
            </span>
          </button>
        </div>
        <p className="text-center text-on-surface-variant/40 text-xs mt-3">
          LUMEMEI AI pode cometer erros. Verifique informações financeiras
          críticas.
        </p>
      </div>
    </div>
  );
}
