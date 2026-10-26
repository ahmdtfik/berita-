import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login Admin — Warta Sekolah" },
      { name: "description", content: "Halaman masuk khusus admin dan operator sekolah." },
      { property: "og:title", content: "Login Admin — Warta Sekolah" },
      { property: "og:description", content: "Halaman masuk khusus admin dan operator sekolah." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("Email atau kata sandi salah"); return; }
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Akun dibuat. Silakan cek email untuk konfirmasi, lalu login.");
      setMode("login");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-gold"><GraduationCap className="h-8 w-8" /></span>
          <h1 className="mt-4 text-2xl font-bold text-primary">{mode === "login" ? "Login Admin" : "Daftar Akun Operator"}</h1>
          <p className="text-sm text-muted-foreground">Khusus admin / operator sekolah</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="pw">Kata Sandi</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}</Button>
        </form>
        <button className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
        <Link to="/" className="mt-2 block text-center text-sm text-primary">← Kembali ke portal</Link>
      </div>
    </div>
  );
}
