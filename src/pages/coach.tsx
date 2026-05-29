import { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Send, User, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Candlestick charts kaise padhte hain?",
  "RSI indicator kya hota hai?",
  "Stop-loss kya hai aur kyun zaroori hai?",
  "Intraday vs Swing trading mein kya fark hai?",
  "P/E ratio simple bhasha mein samjhao",
  "RELIANCE ka technical analysis karo",
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 📈 Main TradeBot hoon — tumhara AI trading coach. Stock markets, technical analysis, trading strategies — kuch bhi pucho, main samjhaunga! Kya jaanna chahte ho?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message ?? "Kuch gadbad ho gayi, dobara try karo!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error! Dobara try karo. 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Namaste! 📈 Main TradeBot hoon — tumhara AI trading coach. Kya jaanna chahte ho?",
    }]);
  };

  return (
    <div className="flex flex-col pb-20" style={{ height: "calc(100vh - 4rem)", background: "#0A0E1A" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid #1E2A40", background: "#0F1629" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,216,151,0.15)" }}>
            <BrainCircuit className="h-4 w-4" style={{ color: "#00D897" }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">TradeBot</p>
            <p className="text-[10px]" style={{ color: "#00D897" }}>● Powered by Grok AI</p>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-xl"
          style={{ background: "#1A2540", border: "1px solid #1E2A40" }}>
          <RotateCcw className="h-4 w-4" style={{ color: "#8B9CB3" }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: "rgba(0,216,151,0.15)" }}>
                <BrainCircuit className="h-3.5 w-3.5" style={{ color: "#00D897" }} />
              </div>
            )}
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: msg.role === "user" ? "#00D897" : "#0F1629",
                color: msg.role === "user" ? "#0A0E1A" : "white",
                border: msg.role === "assistant" ? "1px solid #1E2A40" : "none",
                borderTopLeftRadius: msg.role === "assistant" ? "4px" : "16px",
                borderTopRightRadius: msg.role === "user" ? "4px" : "16px",
              }}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: "#1A2540" }}>
                <User className="h-3.5 w-3.5" style={{ color: "#8B9CB3" }} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,216,151,0.15)" }}>
              <BrainCircuit className="h-3.5 w-3.5" style={{ color: "#00D897" }} />
            </div>
            <div className="rounded-2xl px-4 py-3"
              style={{ background: "#0F1629", border: "1px solid #1E2A40", borderTopLeftRadius: "4px" }}>
              <div className="flex gap-1.5 items-center h-5">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-2 h-2 rounded-full"
                    style={{ background: "#00D897", animation: `pulse 1s ${delay}ms infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
          {STARTER_PROMPTS.map((prompt) => (
            <button key={prompt} onClick={() => sendMessage(prompt)}
              className="shrink-0 text-xs px-3 py-2 rounded-xl whitespace-nowrap"
              style={{ background: "#0F1629", border: "1px solid #1E2A40", color: "#8B9CB3" }}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 items-end flex-shrink-0"
        style={{ borderTop: "1px solid #1E2A40", background: "#0F1629" }}>
        <textarea
          placeholder="Ask me anything about trading..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "#1A2540",
            border: "1px solid #1E2A40",
            color: "white",
            maxHeight: "120px",
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: loading || !input.trim() ? "#1A2540" : "#00D897",
            color: loading || !input.trim() ? "#4A5568" : "#0A0E1A",
          }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
  }
