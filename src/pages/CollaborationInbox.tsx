import { useState, useEffect, useRef } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, ArrowLeft, Send, Handshake, CheckCircle2 } from "lucide-react";

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
  sender_id: string;
  content: string | null;
  created_at: string;
}

const CollaborationInbox = () => {
  const { user } = useAuth();
  useSwipeBack("/admin");
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationWithUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "founder" }).then(({ data }) => {
      setAuthorized(data === true);
      if (data === true) loadConversations();
      else setLoading(false);
    });
  }, [user]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("collaboration_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const enriched: ConversationWithUser[] = [];
    for (const conv of data) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome, cognome, email")
        .eq("user_id", conv.user_id)
        .single();

      const { data: lastMsg } = await supabase
        .from("collaboration_messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      enriched.push({
        id: conv.id,
        user_id: conv.user_id,
        status: conv.status,
        created_at: conv.created_at,
        userName: profile ? `${profile.nome} ${profile.cognome}`.trim() || "Utente" : "Utente",
        userEmail: profile?.email || "",
        lastMessage: lastMsg?.[0]?.content || "Nessun messaggio",
      });
    }
    setConversations(enriched);
    setLoading(false);
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const load = async () => {
      const { data } = await supabase
        .from("collaboration_messages")
        .select("*")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true });
      if (data) { setMessages(data); scrollToBottom(); }
    };
    load();

    const chan = supabase
      .channel(`collab-inbox-${selectedConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "collaboration_messages",
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(chan); };
  }, [selectedConv?.id]);

  // Global realtime
  useEffect(() => {
    if (!authorized) return;
    const chan = supabase
      .channel("collab-inbox-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "collaboration_conversations" }, () => loadConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "collaboration_messages" }, () => loadConversations())
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [authorized]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || !user || sending) return;
    setSending(true);
    await supabase.from("collaboration_messages").insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      content: input.trim(),
    });

    // Accept the conversation when founder responds
    if (selectedConv.status === "pending") {
      await supabase
        .from("collaboration_conversations")
        .update({ status: "accepted" })
        .eq("id", selectedConv.id);
      setSelectedConv(prev => prev ? { ...prev, status: "accepted" } : null);
    }

    setInput("");
    setSending(false);
  };

  const closeConversation = async () => {
    if (!selectedConv) return;
    await supabase
      .from("collaboration_conversations")
      .update({ status: "closed" })
      .eq("id", selectedConv.id);
    setSelectedConv(prev => prev ? { ...prev, status: "closed" } : null);
    loadConversations();
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        <main className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{selectedConv.userName}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedConv.userEmail}</p>
              </div>
              <Badge className={
                selectedConv.status === "accepted"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : selectedConv.status === "closed"
                    ? "bg-muted text-muted-foreground border-border/50"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }>
                {selectedConv.status === "accepted" ? "Accettata" : selectedConv.status === "closed" ? "Chiusa" : "In attesa"}
              </Badge>
              {selectedConv.status !== "closed" && (
                <Button variant="outline" size="sm" onClick={closeConversation} className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Chiudi
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.map((msg) => {
                const isFounder = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isFounder ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isFounder
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                      <p className={`text-[10px] mt-1 ${isFounder ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {selectedConv.status !== "closed" && (
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Rispondi..."
                  className="min-h-[44px] max-h-[100px] resize-none text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim() || sending} className="h-11 w-11 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Collaborazioni — Inbox" backTo="/admin" />

          {conversations.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <Handshake className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nessuna richiesta di collaborazione.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedConv(conv)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Handshake className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{conv.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    <Badge className={
                      conv.status === "accepted"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : conv.status === "closed"
                          ? "bg-muted text-muted-foreground border-border/50"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    }>
                      {conv.status === "accepted" ? "Accettata" : conv.status === "closed" ? "Chiusa" : "In attesa"}
                    </Badge>
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

export default CollaborationInbox;
