import { useState, useEffect, useRef } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Send, Loader2, Bot, UserRound, CheckCircle } from "lucide-react";

interface ConversationWithUser {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
}

interface Message {
  id: string;
  sender_type: string;
  sender_id: string | null;
  content: string | null;
  created_at: string;
}

const SupportInbox = () => {
  const navigate = (await import("react-router-dom")).useNavigate();
  const { user } = useAuth();
  useSwipeBack("/admin");
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationWithUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "founder" }).then(({ data }) => {
      setAuthorized(data === true);
      if (data === true) loadConversations();
      setLoading(false);
    });
  }, [user]);

  const loadConversations = async () => {
    // Only load escalated conversations
    const { data } = await supabase
      .from("support_conversations")
      .select("*")
      .in("status", ["escalated", "closed"])
      .order("updated_at", { ascending: false });

    if (!data) return;

    const enriched: ConversationWithUser[] = [];
    for (const conv of data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome, cognome, email")
        .eq("user_id", conv.user_id)
        .single();

      const { data: lastMsg } = await supabase
        .from("support_messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      enriched.push({
        ...conv,
        userName: profile ? `${profile.nome} ${profile.cognome}`.trim() || profile.email : conv.user_id,
        userEmail: profile?.email || "",
        lastMessage: lastMsg?.content || "",
      });
    }
    setConversations(enriched);
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
      scrollToBottom();
    };
    load();

    const channel = supabase
      .channel(`support-inbox-${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_messages",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv?.id]);

  // Realtime for new escalations
  useEffect(() => {
    if (!authorized) return;
    const channel = supabase
      .channel("support-inbox-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_conversations" }, () => loadConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authorized]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || !user) return;
    const text = input.trim();
    setInput("");
    await supabase.from("support_messages").insert({
      conversation_id: selectedConv.id,
      sender_type: "founder",
      sender_id: user.id,
      content: text,
    });
  };

  const closeConversation = async () => {
    if (!selectedConv) return;
    await supabase
      .from("support_conversations")
      .update({ status: "closed" })
      .eq("id", selectedConv.id);
    setSelectedConv({ ...selectedConv, status: "closed" });
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Shield className="w-12 h-12 text-destructive/50 mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Accesso negato</h1>
        </main>
      </div>
    );
  }

  // Chat view
  if (selectedConv) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{selectedConv.userName}</p>
                <p className="text-xs text-muted-foreground">{selectedConv.userEmail}</p>
              </div>
              <Badge className={selectedConv.status === "escalated" ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"}>
                {selectedConv.status === "escalated" ? "In attesa" : "Chiusa"}
              </Badge>
              {selectedConv.status === "escalated" && (
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={closeConversation}>
                  <CheckCircle className="w-3 h-3" /> Chiudi
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 border border-border/50 rounded-xl bg-card p-3 mb-2">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender_type !== "user" && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        msg.sender_type === "bot" ? "bg-primary/10" : "bg-amber-500/10"
                      }`}>
                        {msg.sender_type === "bot" ? <Bot className="w-3 h-3 text-primary" /> : <UserRound className="w-3 h-3 text-amber-600" />}
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      msg.sender_type === "user"
                        ? "bg-muted/50 text-foreground rounded-br-md"
                        : msg.sender_type === "founder"
                          ? "bg-amber-500/10 text-foreground rounded-bl-md"
                          : "bg-primary/5 text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {selectedConv.status === "escalated" && (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Rispondi..."
                  className="flex-1 text-sm"
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <PageTitle title="Supporto — Inbox" backTo="/admin" />

          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nessuna richiesta di supporto al momento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedConv(conv)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{conv.userName}</p>
                        <Badge className={conv.status === "escalated" ? "bg-amber-500/10 text-amber-600 text-[9px]" : "bg-green-500/10 text-green-600 text-[9px]"}>
                          {conv.status === "escalated" ? "In attesa" : "Chiusa"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || "Nessun messaggio"}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(conv.created_at).toLocaleDateString("it-IT")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupportInbox;
