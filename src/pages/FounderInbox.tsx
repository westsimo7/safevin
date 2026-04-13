import { useState, useEffect, useRef } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Loader2, ArrowLeft, MoreVertical, CheckCircle2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationWithUser {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_nome?: string;
  user_cognome?: string;
  user_email?: string;
  last_message?: string;
  last_message_at?: string;
  unread?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

const FounderInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  useSwipeBack("/admin");
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationWithUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check founder access and load conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: isFounder } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "founder" as const,
      });
      if (!isFounder) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await loadConversations();
      setLoading(false);
    };
    load();
  }, [user]);

  const loadConversations = async () => {
    const { data: convos } = await supabase
      .from("creative_director_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!convos) return;

    // Enrich with user info and last message
    const enriched: ConversationWithUser[] = await Promise.all(
      convos.map(async (c) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nome, cognome, email")
          .eq("user_id", c.user_id)
          .single();

        const { data: lastMsg } = await supabase
          .from("creative_director_messages")
          .select("content, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        return {
          ...c,
          user_nome: profile?.nome || "",
          user_cognome: profile?.cognome || "",
          user_email: profile?.email || "",
          last_message: lastMsg?.[0]?.content || "",
          last_message_at: lastMsg?.[0]?.created_at || c.created_at,
        };
      })
    );

    setConversations(enriched);
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("creative_director_messages")
        .select("*")
        .eq("conversation_id", selectedConv.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    };
    loadMessages();

    const channel = supabase
      .channel(`founder-msg-${selectedConv.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "creative_director_messages",
          filter: `conversation_id=eq.${selectedConv.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
            return [...prev, payload.new as Message];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv?.id]);

  // Global realtime for new conversations
  useEffect(() => {
    if (!authorized) return;
    const channel = supabase
      .channel("founder-convos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "creative_director_conversations" },
        () => loadConversations()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "creative_director_messages" },
        () => loadConversations()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authorized]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || !user) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    const { error } = await supabase.from("creative_director_messages").insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      content: msg,
    });
    if (error) toast({ title: "Errore", description: error.message, variant: "destructive" });
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedConv) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `founder/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    await supabase.from("creative_director_messages").insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      image_url: urlData.publicUrl,
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const markComplete = async () => {
    if (!selectedConv) return;
    const { error } = await supabase.rpc("complete_creative_director_job", {
      p_conversation_id: selectedConv.id,
    });
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Completato", description: "Lavoro completato e credito scalato." });
    setSelectedConv({ ...selectedConv, status: "completed" });
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

  // Chat view when conversation selected
  if (selectedConv) {
    const userName = `${selectedConv.user_nome} ${selectedConv.user_cognome}`.trim() || selectedConv.user_email;
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="font-semibold text-foreground text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">{selectedConv.user_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedConv.status === "completed" && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Completato</Badge>
              )}
              {selectedConv.status === "open" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={markComplete} className="text-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Lavoro completato
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isFounder = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isFounder ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isFounder ? "bg-amber-500 text-white" : "bg-muted text-foreground"
                  }`}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="Allegato" className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                    )}
                    {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    <p className={`text-[10px] mt-1 ${isFounder ? "text-white/60" : "text-muted-foreground"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {selectedConv.status === "open" && (
            <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Rispondi..."
                className="flex-1"
              />
              <Button size="icon" className="shrink-0 bg-amber-500 hover:bg-amber-600" onClick={handleSend} disabled={!input.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Conversation list (WhatsApp style)
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Creative Director — Inbox" backTo="/admin" />

          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nessuna conversazione ancora.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const name = `${conv.user_nome} ${conv.user_cognome}`.trim() || conv.user_email;
                const initial = (conv.user_nome?.[0] || conv.user_email?.[0] || "?").toUpperCase();
                return (
                  <Card
                    key={conv.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedConv(conv)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm truncate">{name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(conv.last_message_at || conv.created_at).toLocaleDateString("it-IT")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message || "Nessun messaggio"}
                          </p>
                          {conv.status === "completed" && (
                            <Badge variant="outline" className="text-[10px] ml-2 bg-green-500/10 text-green-600 border-green-500/30 shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FounderInbox;
