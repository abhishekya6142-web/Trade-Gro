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
