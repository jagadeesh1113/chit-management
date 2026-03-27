/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  UIMessage,
  isTextUIPart,
  isToolUIPart,
} from "ai";
import React from "react";
import {
  BotIcon,
  SendIcon,
  UserIcon,
  Loader2Icon,
  SparklesIcon,
  ChevronDownIcon,
  RotateCcwIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PageContext } from "./AgentProvider";

// ── Suggestion chips — vary by page context ───────────────────────────────────
const HOME_SUGGESTIONS = [
  "Show all my chits",
  "Create a new chit",
  "How many chits do I have?",
];

const CHIT_SUGGESTIONS = [
  "Show all members",
  "Show all months",
  "Add a new member",
  "Record a payment",
  "Who hasn't paid this month?",
  "Add a new month",
];

// ── Tool name → human label map ───────────────────────────────────────────────
const TOOL_LABELS: Record<string, string> = {
  listChits: "Fetching chits",
  getChitDetails: "Loading chit details",
  listMembers: "Fetching members",
  listMonths: "Fetching months",
  listPayments: "Fetching payments",
  getMemberPayments: "Fetching member payments",
  createChit: "Creating chit",
  addMembers: "Adding members",
  addMonth: "Adding month",
  recordPayment: "Recording payment",
  updateChit: "Updating chit",
  updateMember: "Updating member",
  updateMonth: "Updating month",
  updatePayment: "Updating payment",
  deleteChit: "Deleting chit",
  deleteMember: "Removing member",
  deleteMonth: "Deleting month",
  deletePayment: "Deleting payment",
};

// ── Markdown-lite renderer (bold, inline code, line breaks) ──────────────────
const Prose = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code
              key={i}
              className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        if (part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// ── Tool call status pill ─────────────────────────────────────────────────────
const ToolPill = ({ toolName, state }: { toolName: string; state: string }) => {
  const done = state === "output-available" || state === "output-error";
  const label = TOOL_LABELS[toolName] ?? toolName;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border",
        done
          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
          : "bg-muted text-muted-foreground border-border",
      )}
    >
      {done ? (
        <span className="size-1.5 rounded-full bg-green-500 inline-block" />
      ) : (
        <Loader2Icon className="size-3 animate-spin" />
      )}
      {label}
    </span>
  );
};

// ── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble = ({ message }: { message: UIMessage }) => {
  const isUser = message.role === "user";

  const textContent = message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolParts = message.parts.filter(
    (p): p is any => p.type === "dynamic-tool" || isToolUIPart(p as never),
  );

  return (
    <div
      className={cn(
        "flex gap-2.5 w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="size-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <BotIcon className="size-3.5 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[85%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {toolParts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolParts.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (part: any, i: number) => (
                <ToolPill
                  key={part.toolCallId ?? i}
                  toolName={part.toolName}
                  state={part.state}
                />
              ),
            )}
          </div>
        )}

        {textContent && (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted text-foreground rounded-tl-sm",
            )}
          >
            <Prose text={textContent} />
          </div>
        )}
      </div>

      {isUser && (
        <div className="size-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
          <UserIcon className="size-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

// ── Main chat component ───────────────────────────────────────────────────────
export const AgentChat = ({
  isOpen,
  onClose,
  pageContext,
}: {
  isOpen: boolean;
  onClose: () => void;
  pageContext: PageContext;
}) => {
  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const submit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    sendMessage(
      { text },
      {
        body: {
          pageContext,
        },
      },
    );
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    sendMessage(
      { text },
      {
        body: {
          pageContext,
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  if (!isOpen) return null;

  const isEmpty = messages.length === 0;
  const suggestions =
    pageContext.page === "chit" ? CHIT_SUGGESTIONS : HOME_SUGGESTIONS;
  const contextLabel =
    pageContext.page === "chit"
      ? (pageContext.chitName ?? "Current chit")
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto flex flex-col w-full sm:w-[420px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden",
          "h-[85vh] sm:h-[620px]",
          "animate-in slide-in-from-bottom-4 fade-in-0 duration-200",
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <SparklesIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                Chit Assistant
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {isLoading
                  ? "Thinking…"
                  : contextLabel
                    ? `📍 ${contextLabel}`
                    : "Ready to help"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setMessages([])}
                title="Clear chat"
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClose}
            >
              <ChevronDownIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <SparklesIcon className="size-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">How can I help?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pageContext.page === "chit"
                    ? `I'm ready to help with ${contextLabel ?? "this chit"} — members, months, payments and more.`
                    : "Ask me to manage your chits, members, months and payments."}
                </p>
              </div>

              {/* Page context badge */}
              {pageContext.page === "chit" && contextLabel && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                  {contextLabel}
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-2.5 justify-start">
              <div className="size-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <BotIcon className="size-3.5 text-primary-foreground" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input ───────────────────────────────────────────────────────── */}
        <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                pageContext.page === "chit"
                  ? "Ask about members, months, payments…"
                  : "Ask anything about your chits…"
              }
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[24px] max-h-[120px] leading-6 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={isLoading || !input.trim()}
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mb-0.5",
                input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <SendIcon className="size-3.5" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-1.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Floating trigger button ───────────────────────────────────────────────────
export const AgentTrigger = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "fixed bottom-5 right-5 z-40 size-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
      "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
      isOpen && "scale-90 opacity-0 pointer-events-none",
    )}
    aria-label="Open Chit Assistant"
  >
    <SparklesIcon className="size-5" />
  </button>
);
