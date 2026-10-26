import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, LogOut, ExternalLink, Bold, Italic, Heading2, List } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, formatDate, slugify, type Category, type Post } from "@/lib/posts";
import { CategoryBadge } from "@/components/site/PostCard";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Dashboard Admin — Warta Sekolah" }, { name: "description", content: "Kelola konten portal berita sekolah." }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Form = { id?: string; title: string; category: Category; excerpt: string; content: string; image_url: string; author_name: string; featured: boolean; event_date: string; event_location: string };
const empty: Form = { title: "", category: "berita", excerpt: "", content: "", image_url: "", author_name: "Admin Sekolah", featured: false, event_date: "", event_location: "" };

function Admin() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [form, setForm] = useState<Form | null>(null);

  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data === true,
  });
  const posts = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => ((await supabase.from("posts").select("*").order("published_at", { ascending: false })).data ?? []) as Post[],
  });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function remove(p: Post) {
    if (!confirm(`Hapus "${p.title}"?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Postingan dihapus");
    qc.invalidateQueries();
  }

  if (role.isLoading) return <div className="p-10 text-center text-muted-foreground">Memuat...</div>;
  if (!role.data) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold text-primary">Akses ditolak</h1>
      <p className="max-w-md text-muted-foreground">Akun {user.email} belum memiliki hak admin. Hubungi administrator utama.</p>
      <Button variant="outline" onClick={signOut}>Keluar</Button>
    </div>
  );

  const list = (posts.data ?? []).filter((p) => filter === "all" || p.category === filter);
  const counts = (Object.keys(CATEGORIES) as Category[]).map((c) => ({ c, n: (posts.data ?? []).filter((p) => p.category === c).length }));

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div><div className="font-display text-xl font-bold">Dashboard Admin</div><div className="text-xs text-primary-foreground/70">{user.email}</div></div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm"><Link to="/"><ExternalLink className="h-4 w-4" />Lihat Portal</Link></Button>
            <Button variant="secondary" size="sm" onClick={signOut}><LogOut className="h-4 w-4" />Keluar</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {counts.map(({ c, n }) => (
            <div key={c} className="rounded-lg border-l-4 border-gold bg-card p-4"><div className="text-sm text-muted-foreground">{CATEGORIES[c].short}</div><div className="text-3xl font-bold text-primary">{n}</div></div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as Category | "all")}>
            <SelectTrigger className="w-56 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kategori</SelectItem>
              {(Object.keys(CATEGORIES) as Category[]).map((c) => <SelectItem key={c} value={c}>{CATEGORIES[c].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setForm({ ...empty })}><Plus className="h-4 w-4" />Tambah Postingan</Button>
        </div>
        <div className="overflow-hidden rounded-lg bg-card">
          {list.length === 0 && <p className="p-10 text-center text-muted-foreground">Belum ada postingan.</p>}
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border-b p-4 last:border-0">
              {p.image_url ? <img src={p.image_url} alt="" className="hidden h-14 w-20 rounded object-cover sm:block" /> : <div className="hidden h-14 w-20 rounded bg-muted sm:block" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><CategoryBadge category={p.category} />{p.featured && <span className="text-xs font-semibold text-primary">★ Unggulan</span>}</div>
                <div className="mt-1 truncate font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.author_name} · {formatDate(p.published_at)}</div>
              </div>
              <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setForm({
                id: p.id, title: p.title, category: p.category, excerpt: p.excerpt ?? "", content: p.content, image_url: p.image_url ?? "",
                author_name: p.author_name, featured: p.featured, event_location: p.event_location ?? "",
                event_date: p.event_date ? toLocalInput(p.event_date) : "",
              })}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Hapus" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </main>
      {form && <PostDialog form={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); qc.invalidateQueries(); }} />}
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function PostDialog({ form: initial, onClose, onSaved }: { form: Form; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Form>(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  async function upload(file: File) {
    setBusy(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) { setBusy(false); { toast.error("Gagal upload: " + error.message); return; } }
    const { data } = await supabase.storage.from("post-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (data) { set("image_url", data.signedUrl); toast.success("Gambar diunggah"); }
  }

  function wrap(before: string, after = before) {
    const el = document.getElementById("content") as HTMLTextAreaElement | null;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    set("content", value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: f.title, category: f.category, excerpt: f.excerpt || null, content: f.content, image_url: f.image_url || null,
      author_name: f.author_name || "Admin Sekolah", featured: f.featured,
      event_date: f.category === "agenda" && f.event_date ? new Date(f.event_date).toISOString() : null,
      event_location: f.category === "agenda" ? f.event_location || null : null,
      updated_at: new Date().toISOString(),
    };
    if (f.featured) await supabase.from("posts").update({ featured: false }).eq("featured", true);
    const { error } = f.id
      ? await supabase.from("posts").update(payload).eq("id", f.id)
      : await supabase.from("posts").insert({ ...payload, slug: `${slugify(f.title)}-${Date.now().toString(36)}` });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(f.id ? "Postingan diperbarui" : "Postingan diterbitkan");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? "Edit Postingan" : "Tambah Postingan"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Judul</Label><Input required value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Kategori</Label>
              <Select value={f.category} onValueChange={(v) => set("category", v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(CATEGORIES) as Category[]).map((c) => <SelectItem key={c} value={c}>{CATEGORIES[c].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Penulis</Label><Input value={f.author_name} onChange={(e) => set("author_name", e.target.value)} /></div>
          </div>
          {f.category === "agenda" && (
            <div className="grid gap-4 rounded-md bg-accent/50 p-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Tanggal & Waktu Acara</Label><Input type="datetime-local" required value={f.event_date} onChange={(e) => set("event_date", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Lokasi</Label><Input value={f.event_location} onChange={(e) => set("event_location", e.target.value)} /></div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Gambar Utama</Label>
            <Input type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {f.image_url && <img src={f.image_url} alt="" className="mt-2 h-32 rounded object-cover" />}
          </div>
          <div className="space-y-1.5"><Label>Ringkasan</Label><Textarea rows={2} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Isi Berita</Label>
            <div className="overflow-hidden rounded-md border">
              <div className="flex gap-1 border-b bg-muted p-1">
                <Button type="button" size="icon" variant="ghost" onClick={() => wrap("**")}><Bold className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => wrap("_")}><Italic className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => wrap("\n\n## ", "\n\n")}><Heading2 className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => wrap("\n- ", "")}><List className="h-4 w-4" /></Button>
              </div>
              <Textarea id="content" required rows={12} className="rounded-none border-0 focus-visible:ring-0" placeholder="Tulis isi berita. Pisahkan paragraf dengan baris kosong." value={f.content} onChange={(e) => set("content", e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-3"><Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} /><span className="text-sm">Jadikan berita unggulan di beranda</span></label>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Batal</Button><Button type="submit" disabled={busy}>{busy ? "Menyimpan..." : "Simpan"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
