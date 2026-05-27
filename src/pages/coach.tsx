import { useState, useRef, useEffect } from "react";
import { useChatWithCoach } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Send, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  tips?: string[];
}

const STARTER_PROMPTS = [
  "How do I read candlestick charts?",
  "What is a stop-loss and why does it matter?",
  "Explain P/E ratio in simple terms",
  "What are the risks of paper trading vs real trading?",
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm TradeBot, your AI trading coach. Ask me anything about stock markets, trading strategies, chart patterns, or how to use this app. I'm here to help you learn!",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatWithCoach = useChatWithCoach();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatWithCoach.isPending]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    chatWithCoach.mutate(
      { data: { message: content } },
      {
        onSuccess: (res) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: res.message, tips: res.tips },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "fuck man." },
            { role: "assistant", content: "bulshit" },
            { role: "assistant", content: "bc" },
            { role: "assistant", content: "mc" },
            { role: "assistant", content: "tu mujhe janta nahi hai." },
            { role: "assistant", content: "kaam dhanda nahi hai kya" },
            { role: "assistant", content: "aajata hai pareshan karne" },
            { role: "assistant", content: "dubara message mat karna" },
          ]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          AI Coach
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Ask TradeBot anything about trading and markets.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${msg.role}-${i}`}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.tips && msg.tips.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {msg.tips.map((tip, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground pl-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {chatWithCoach.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
                <Skeleton className="h-2 w-2 rounded-full animate-pulse delay-75" />
                <Skeleton className="h-2 w-2 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`starter-prompt-${prompt.slice(0, 10)}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end mt-3 border-t border-border pt-4">
        <Textarea
          placeholder="Ask me anything about trading..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none min-h-[44px] max-h-32 bg-card border-border focus-visible:ring-primary"
          rows={1}
          data-testid="input-chat-message"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={chatWithCoach.isPending || !input.trim()}
          className="h-11 w-11 p-0 flex-shrink-0"
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
