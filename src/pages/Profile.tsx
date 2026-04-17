import { useState, useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  useSwipeBack("/home");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    avatar_url: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nome, cognome, email, telefono, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          nome: data.nome || "",
          cognome: data.cognome || "",
          email: data.email || "",
          telefono: data.telefono || "",
          avatar_url: (data as any).avatar_url || "",
        });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          cognome: profile.cognome,
          telefono: profile.telefono,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Salvato", description: "Profilo aggiornato con successo." });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File troppo grande", description: "Massimo 5MB.", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url } as any)
        .eq("user_id", user.id);
      if (updErr) throw updErr;
      setProfile((p) => ({ ...p, avatar_url: url }));
      toast({ title: "Foto profilo aggiornata" });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-20">
        <PageTitle title="Profilo Utente" backTo="/home" />

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border border-border">
                  <AvatarImage src={profile.avatar_url || undefined} alt="Foto profilo" />
                  <AvatarFallback className="bg-muted">
                    <User className="w-7 h-7 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background hover:bg-muted cursor-pointer text-xs font-medium transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {uploadingAvatar ? "Caricamento..." : profile.avatar_url ? "Cambia foto" : "Carica foto"}
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">JPG o PNG, max 5MB</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  placeholder="Il tuo nome"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cognome</Label>
                <Input
                  placeholder="Il tuo cognome"
                  value={profile.cognome}
                  onChange={(e) => setProfile({ ...profile, cognome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input type="email" value={profile.email} disabled className="opacity-60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Telefono</Label>
                <Input
                  type="tel"
                  placeholder="+39 000 000 0000"
                  value={profile.telefono}
                  onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
