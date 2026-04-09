import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const SUGGESTED_QUESTIONS = [
  "Come posso migliorare il mio ultimo annuncio?",
  "Quali errori comuni abbassano il SafeScore?",
  "Come scrivere un titolo efficace su Vinted?",
  "Come evitare il shadowban su Vinted?",
  "Che prezzo dovrei mettere per vendere velocemente?",
  "Qual è la differenza tra Audit e Studio?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  // Extract images from the first user message if present
  const firstUserMsg = messages.find(m => m.role === "user" && m.images?.length);
  const images = firstUserMsg?.images || [];
  
  // Send messages without the images field to keep payload clean for subsequent messages
  const cleanMessages = messages.map(({ images: _img, ...rest }) => rest);
  
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: cleanMessages, images }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Errore di rete" }));
    onError(err.error || "Errore dal server");
    return;
  }

  if (!resp.body) {
    onError("Nessuna risposta dallo stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") break;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

interface CoachWidgetProps {
  open: boolean;
  onClose: () => void;
}

const CoachWidget = ({ open, onClose }: CoachWidgetProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Listen for external "open-coach" events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.message) {
        setTimeout(() => sendMessage(detail.message), 300);
      }
    };
    window.addEventListener("open-coach", handler);
    return () => window.removeEventListener("open-coach", handler);
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (err) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err}` }]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Errore di connessione." }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-16 right-2 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[380px] max-h-[70vh] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-primary/5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">SafeVin Coach</p>
            <p className="text-[10px] text-muted-foreground">AI • Conosce i tuoi dati</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Chiedimi qualsiasi cosa su vendite, annunci, o i tuoi dati SafeVin:
            </p>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="w-full text-left p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 transition-colors text-xs text-foreground/80 leading-relaxed"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/40 border border-border/30 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1.5 [&_p]:text-sm [&_ul]:text-xs [&_li]:text-foreground/80 [&_strong]:text-primary [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted/40 border border-border/30 rounded-2xl rounded-bl-sm px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested after first exchange */}
      {messages.length > 0 && messages.length <= 4 && !isLoading && (
        <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto shrink-0">
          {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-muted/30 border border-border/30 text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              {q.length > 35 ? q.slice(0, 35) + "…" : q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachWidget;
