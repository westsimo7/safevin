import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, UserRound, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

type Msg = { role: "user" | "assistant"; content: string };

interface SupportMessage {
  id: string;
  sender_type: string;
  sender_id: string | null;
  content: string | null;
  created_at: string;
}

const SupportChat = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [dbMessages, setDbMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [convStatus, setConvStatus] = useState<string>("bot");
  const [initLoading, setInitLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  // Load or create conversation
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const conv = data[0];
        setConversationId(conv.id);
        setConvStatus(conv.status);

        // Load messages
        const { data: msgs } = await supabase
          .from("support_messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        if (msgs) {
          setDbMessages(msgs);
          // Rebuild AI chat history from db messages
          const aiMsgs: Msg[] = msgs
            .filter((m) => m.content)
            .map((m) => ({
              role: m.sender_type === "user" ? "user" as const : "assistant" as const,
              content: m.content!,
            }));
          setMessages(aiMsgs);
        }
      }
      setInitLoading(false);
    };
    load();
  }, [user]);

  // Realtime for founder messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`support-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as SupportMessage;
        if (msg.sender_type === "founder" && msg.content) {
          setDbMessages((prev) => [...prev, msg]);
          setMessages((prev) => [...prev, { role: "assistant", content: msg.content! }]);
          scrollToBottom();
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "support_conversations",
        filter: `id=eq.${conversationId}`,
      }, (payload) => {
        setConvStatus((payload.new as any).status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const startConversation = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_conversations")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (data) {
      setConversationId(data.id);
      setConvStatus(data.status);
      setMessages([]);
      setDbMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || streaming) return;
    const userText = input.trim();
    setInput("");

    // Save to DB
    if (conversationId) {
      await supabase.from("support_messages").insert({
        conversation_id: conversationId,
        sender_type: "user",
        sender_id: user.id,
        content: userText,
      });
    }

    // If escalated, just save - founder will reply
    if (convStatus === "escalated") {
      setMessages((prev) => [...prev, { role: "user", content: userText }]);
      scrollToBottom();
      return;
    }

    // Check if user wants operator
    const wantsOperator = /\b(operatore|umano|persona|parlare con|supporto umano|assistenza umana)\b/i.test(userText);

    const userMsg: Msg = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);
    scrollToBottom();

    if (wantsOperator) {
      // Escalate
      if (conversationId) {
        await supabase
          .from("support_conversations")
          .update({ status: "escalated" })
          .eq("id", conversationId);
        setConvStatus("escalated");
      }
      const escalateMsg = "Ho inoltrato la tua richiesta a un operatore. Riceverai una risposta il prima possibile! 🙏";
      setMessages((prev) => [...prev, { role: "assistant", content: escalateMsg }]);
      if (conversationId) {
        await supabase.from("support_messages").insert({
          conversation_id: conversationId,
          sender_type: "bot",
          content: escalateMsg,
        });
      }
      setStreaming(false);
      scrollToBottom();
      return;
    }

    // Stream from AI
    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > newMessages.length - 1) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
              scrollToBottom();
            }
          } catch { /* partial JSON */ }
        }
      }

      // Save bot response to DB
      if (conversationId && assistantSoFar) {
        await supabase.from("support_messages").insert({
          conversation_id: conversationId,
          sender_type: "bot",
          content: assistantSoFar,
        });
      }
    } catch (e) {
      console.error(e);
      const errMsg = "Mi dispiace, c'è stato un errore. Riprova tra poco! 😔";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    }
    setStreaming(false);
    scrollToBottom();
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Assistenza</h3>
          <p className="text-sm text-muted-foreground mt-1">Il tuo assistente SafeViN. Chiedimi qualsiasi cosa!</p>
        </div>
        <Button onClick={startConversation} className="gap-2">
          <Bot className="w-4 h-4" /> Inizia conversazione
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px] border border-border/50 rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-muted/30">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Assistenza</p>
          <p className="text-[10px] text-muted-foreground">
            {convStatus === "escalated" ? "Connesso con operatore" : convStatus === "closed" ? "Conversazione chiusa" : "Assistente AI"}
          </p>
        </div>
        {convStatus !== "closed" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-6 text-muted-foreground"
            onClick={async () => {
              setConversationId(null);
              setMessages([]);
              setDbMessages([]);
              setConvStatus("bot");
            }}
          >
            Nuova chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">👋 Ciao! Come posso aiutarti?</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Scrivi "operatore" se vuoi parlare con una persona
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted/50 text-foreground rounded-bl-md"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center shrink-0 mt-1">
                  <UserRound className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {streaming && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-bl-md px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      {convStatus !== "closed" && (
        <div className="border-t border-border/50 p-2 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={convStatus === "escalated" ? "Scrivi all'operatore..." : "Scrivi all'assistenza..."}
            className="flex-1 text-sm"
            disabled={streaming}
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || streaming}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
