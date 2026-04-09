import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Send, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import AppNavbar from "@/components/AppNavbar";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { saveCoachMessages, loadCoachMessages, saveCoachImages, loadCoachImages, clearCoachChat } from "@/lib/coachStore";

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`;

async function streamChat({
  messages, images, onDelta, onDone, onError,
}: { messages: Msg[]; images?: string[]; onDelta: (text: string) => void; onDone: () => void; onError: (msg: string) => void; }) {
  const cleanMessages = messages.map(({ images: _img, ...rest }) => rest);

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: cleanMessages, images: images || [] }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Errore di rete" }));
    onError(err.error || "Errore dal server");
    return;
  }

  if (!resp.body) { onError("Nessuna risposta dallo stream"); return; }

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

const Coach = () => {
  useSwipeBack("/home");
  const location = useLocation();
  const [messages, setMessages] = useState<Msg[]>(() => loadCoachMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studioImages, setStudioImages] = useState<string[]>(() => loadCoachImages());
  const scrollRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // Persist messages on change
  useEffect(() => { saveCoachMessages(messages); }, [messages]);
  useEffect(() => { saveCoachImages(studioImages); }, [studioImages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-send initial message from Studio if provided via location state
  useEffect(() => {
    if (initRef.current) return;
    const state = location.state as { message?: string; images?: string[]; studioReport?: string } | null;
    if (state?.studioReport && state?.images?.length) {
      initRef.current = true;
      const imgs = state.images;
      setStudioImages(imgs);
      setTimeout(() => triggerCoachIntro(state.studioReport!, imgs), 300);
    } else if (state?.message) {
      initRef.current = true;
      const imgs = state.images || [];
      if (imgs.length) setStudioImages(imgs);
      setTimeout(() => sendMessage(state.message!, imgs), 300);
    }
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const triggerCoachIntro = async (report: string, imgs: string[]) => {
    setIsLoading(true);
    const contextMsg: Msg = {
      role: "user",
      content: `[STUDIO PHOTO REVIEW]\n\nResoconto qualità foto:\n${report}\n\nHo allegato le foto del mio annuncio. Analizza le foto e il resoconto, poi presentami un recap di quello che hai trovato e chiedimi se voglio procedere con i feedback migliorativi.`,
      images: imgs,
    };

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
        messages: [contextMsg],
        images: imgs,
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

  const sendMessage = useCallback(async (text: string, attachedImages?: string[]) => {
    if (!text.trim() || isLoading) return;
    const imgs = attachedImages?.length ? attachedImages : undefined;
    const userMsg: Msg = { role: "user", content: text.trim(), images: imgs };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const allImages = studioImages.length > 0 ? studioImages : [];

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
        images: allImages,
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
  }, [messages, isLoading, studioImages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearChat = () => {
    clearCoachChat();
    setMessages([]);
    setStudioImages([]);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 flex flex-col overflow-hidden w-full px-4 sm:px-6 lg:px-64 xl:px-96">
        {/* Header */}
        <div className="py-4 sm:py-6 shrink-0 flex items-center justify-between">
          <div className="flex-1 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 text-[11px] sm:text-xs">
              SafeVin Coach
            </Badge>
            <h1 className="text-xl sm:text-2xl font-bold">Il tuo assistente di vendita</h1>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={handleClearChat}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Pinned studio photos */}
        {studioImages.length > 0 && (
          <div className="shrink-0 pb-2 border-b border-border/30 mb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5">📷 Foto annuncio</p>
            <div className="flex gap-1.5 overflow-x-auto">
              {studioImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Foto ${idx + 1}`} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border/30" />
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {messages.length === 0 && !isLoading && studioImages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Scrivi un messaggio per iniziare</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/40 border border-border/30 rounded-bl-sm"
                }`}
              >
                {msg.images && msg.images.length > 0 && (
                  <div className="flex gap-1 mb-2 overflow-x-auto">
                    {msg.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Foto ${idx + 1}`} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ))}
                  </div>
                )}
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

        {/* Input */}
        <div className="py-3 shrink-0">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              className="flex-1 bg-muted/30 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Coach;
