import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Palette, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAttachmentSignedUrl } from "@/lib/chatAttachments";

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  status: string;
}

const MAX_PHOTOS_PER_JOB = 8;

const SignedImage = ({ value, className }: { value: string; className?: string }) => {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    getAttachmentSignedUrl(value).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [value]);
  if (!url) return <div className={`${className} bg-muted animate-pulse`} />;
  return <img src={url} alt="Allegato" className={className} />;
};

const CreativeDirectorChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Photos uploaded by THIS user in current conversation
  const userPhotoCount = messages.filter(
    (m) => m.sender_id === user?.id && m.image_url
  ).length;
  const photosRemaining = Math.max(0, MAX_PHOTOS_PER_JOB - userPhotoCount);

  useEffect(() => {
    if (!user) return;
    const loadConversation = async () => {
      const { data: convos } = await supabase
        .from("creative_director_conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      if (convos && convos.length > 0) {
        setConversation(convos[0]);
      }
      setLoading(false);
    };
    loadConversation();
  }, [user]);

  useEffect(() => {
    if (!conversation) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("creative_director_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setTimeout(scrollToBottom, 100);
    };
    loadMessages();

    const channel = supabase
      .channel(`cd-messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "creative_director_messages",
          filter: `conversation_id=eq.${conversation.id}`,
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

    const convChannel = supabase
      .channel(`cd-conv-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "creative_director_conversations",
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => {
          setConversation(payload.new as Conversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(convChannel);
    };
  }, [conversation?.id]);

  useEffect(scrollToBottom, [messages]);

  const startWork = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("creative_director_conversations")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      return;
    }
    setConversation(data);
  };

  const sendMessage = async (content?: string, imagePath?: string) => {
    if (!conversation || !user) return;
    if (!content && !imagePath) return;
    setSending(true);
    const { error } = await supabase.from("creative_director_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: content || null,
      image_url: imagePath || null,
    });
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    }
    setSending(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (photosRemaining <= 0) {
      toast({
        title: "Limite raggiunto",
        description: `Puoi inviare al massimo ${MAX_PHOTOS_PER_JOB} foto per annuncio.`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("chat-attachments")
      .upload(path, file);
    if (error) {
      toast({ title: "Errore upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    // Store the storage PATH (not a public URL) — bucket is private, we render via signed URLs.
    await sendMessage(undefined, path);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Palette className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Artist Director</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Il team SAFEViN creerà il tuo annuncio professionale. Inizia un lavoro e comunica con noi direttamente.
        </p>
        <Button
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-base rounded-xl"
          onClick={startWork}
        >
          Inizia Lavoro
        </Button>
      </div>
    );
  }

  if (conversation.status === "completed") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {msg.image_url && (
                    <SignedImage value={msg.image_url} className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                  )}
                  {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-border text-center">
          <div className="bg-green-500/10 text-green-600 rounded-xl px-4 py-3 text-sm font-medium">
            ✅ Lavoro completato
          </div>
          <Button className="mt-3 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => { setConversation(null); setMessages([]); }}>
            Inizia nuovo lavoro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="px-4 py-2 border-b border-border text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Foto inviate</span>
        <span className={`font-semibold ${photosRemaining === 0 ? "text-destructive" : "text-foreground"}`}>
          {userPhotoCount} / {MAX_PHOTOS_PER_JOB}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            Invia un messaggio al team Artist Director per iniziare.
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {msg.image_url && (
                  <SignedImage value={msg.image_url} className="rounded-lg mb-2 max-w-full max-h-48 object-cover" />
                )}
                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photosRemaining <= 0}
          title={photosRemaining <= 0 ? `Max ${MAX_PHOTOS_PER_JOB} foto per annuncio` : "Allega foto"}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Scrivi un messaggio..."
          className="flex-1"
        />
        <Button
          size="icon"
          className="shrink-0 bg-primary"
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CreativeDirectorChat;
