import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Handshake, Clock, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  status: string;
}

const CollaborationChat = () => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  // Load existing conversation
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("collaboration_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setConversation({ id: data[0].id, status: data[0].status });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) return;
    const load = async () => {
      const { data } = await supabase
        .from("collaboration_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    };
    load();

    // Realtime for new messages
    const chan = supabase
      .channel(`collab-msgs-${conversation.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "collaboration_messages",
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        scrollToBottom();
      })
      .subscribe();

    // Realtime for conversation status updates
    const statusChan = supabase
      .channel(`collab-status-${conversation.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "collaboration_conversations",
        filter: `id=eq.${conversation.id}`,
      }, (payload) => {
        const updated = payload.new as Conversation;
        setConversation(prev => prev ? { ...prev, status: updated.status } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chan);
      supabase.removeChannel(statusChan);
    };
  }, [conversation?.id]);

  const startConversation = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("collaboration_conversations")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (data && !error) {
      setConversation({ id: data.id, status: data.status });
    }
  };

  const canSendMessage = () => {
    if (!conversation) return false;
    // If status is "pending", user already sent a message and must wait for acceptance
    if (conversation.status === "pending") {
      // Check if user has sent a message that hasn't been responded to
      const userMessages = messages.filter(m => m.sender_id === user?.id);
      const founderMessages = messages.filter(m => m.sender_id !== user?.id);
      // User can't send if their last message hasn't been responded to by founder
      if (userMessages.length > founderMessages.length) return false;
    }
    if (conversation.status === "closed") return false;
    return true;
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || !user || sending) return;
    if (!canSendMessage()) return;

    setSending(true);
    const content = input.trim();
    setInput("");

    await supabase.from("collaboration_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content,
    });

    // Set status to pending after user sends
    if (conversation.status === "accepted" || conversation.status === "pending") {
      // Status stays pending until founder responds
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <Handshake className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">Collaborazioni</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Scrivi direttamente al team SAFEViN per proposte di collaborazione.
            <br />
            <span className="text-xs text-muted-foreground/60">Puoi inviare un messaggio alla volta — il team dovrà accettarlo prima che tu possa inviarne un altro.</span>
          </p>
          <Button onClick={startConversation} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <Handshake className="w-4 h-4" />
            Inizia una collaborazione
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (conversation.status === "closed") {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-1">Collaborazione conclusa</h3>
          <p className="text-sm text-muted-foreground mb-4">Questa collaborazione è stata chiusa.</p>
          <Button variant="outline" onClick={() => { setConversation(null); setMessages([]); }} className="gap-2">
            <Handshake className="w-4 h-4" />
            Nuova collaborazione
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sendAllowed = canSendMessage();

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50">
        <Handshake className="w-5 h-5 text-amber-500" />
        <span className="font-semibold text-sm">Collaborazioni — Team SAFEViN</span>
        <Badge className={
          conversation.status === "accepted"
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 ml-auto"
            : "bg-amber-500/10 text-amber-500 border-amber-500/30 ml-auto"
        }>
          {conversation.status === "accepted" ? "Accettata" : "In attesa"}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                isMe
                  ? "bg-amber-500 text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground/60"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input or waiting message */}
      {!sendAllowed ? (
        <div className="p-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>In attesa di risposta dal team SAFEViN...</span>
        </div>
      ) : (
        <div className="p-3 border-t border-border/50 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi la tua proposta..."
            className="min-h-[44px] max-h-[100px] resize-none text-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-11 w-11 bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CollaborationChat;
