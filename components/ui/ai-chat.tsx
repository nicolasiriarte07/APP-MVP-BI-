"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Send, Sparkles } from "lucide-react";
import { Avatar } from "./avatar";

interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp?: string;
}

interface AIChatSuggestion {
  content: string;
  onApply?: () => void;
}

interface AIChatProps {
  messages?: ChatMessage[];
  suggestion?: AIChatSuggestion;
  onSend?: (message: string) => void;
  isLoading?: boolean;
  userAvatarSrc?: string;
  className?: string;
}

const TypingIndicator = () => (
  <div className="flex gap-1 ml-11 mb-4" role="status" aria-label="AI is typing">
    {[0, 160, 320].map((delay) => (
      <div
        key={delay}
        className="w-1.5 h-1.5 rounded-full bg-[var(--secondary-400)] animate-bounce-dot"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

const AIChat = ({
  messages = [],
  suggestion,
  onSend,
  isLoading = false,
  userAvatarSrc,
  className,
}: AIChatProps) => {
  const [input, setInput] = React.useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "max-w-md mx-auto bg-[var(--bg-body)] p-4 rounded-[var(--radius-lg)]",
        className
      )}
    >
      {/* Messages */}
      <div className="flex flex-col gap-0">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "ai" ? (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-[var(--primary-600)] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="bg-white px-3 py-3 rounded-[0_12px_12px_12px] shadow-[var(--shadow-sm)] text-sm text-[var(--secondary-700)] max-w-[85%]">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mb-4 justify-end">
                <div className="bg-[var(--primary-600)] text-white px-3 py-3 rounded-[12px_0_12px_12px] text-sm max-w-[85%]">
                  {msg.content}
                </div>
                <Avatar src={userAvatarSrc} alt="User" size="sm" fallback="U" />
              </div>
            )}
          </div>
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* Suggestion Card */}
      {suggestion && (
        <div
          className="bg-white rounded-[var(--radius-lg)] p-4 mb-4 border-l-4"
          style={{ borderLeftColor: "var(--primary-600)" }}
        >
          <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-[var(--primary-700)]">
            <Sparkles size={14} />
            Suggestion
          </div>
          <p className="text-[13px] text-[var(--secondary-600)] mb-3">{suggestion.content}</p>
          {suggestion.onApply && (
            <Button variant="outline" size="sm" className="w-full" onClick={suggestion.onApply}>
              Apply to Record
            </Button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <textarea
          className={cn(
            "w-full px-4 py-3 pr-12 border border-[var(--secondary-200)] rounded-[var(--radius-md)] text-sm text-[var(--secondary-900)] bg-[var(--bg-surface)] resize-none placeholder:text-[var(--secondary-400)] focus:outline-none focus:border-[var(--primary-600)] focus:ring-2 focus:ring-[var(--primary-100)]"
          )}
          rows={2}
          placeholder="Ask medical assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="primary"
          size="icon-sm"
          className="absolute right-2 bottom-2"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
};

export { AIChat };
export type { ChatMessage, AIChatSuggestion };
