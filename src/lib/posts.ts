export type Category = "berita" | "pengumuman" | "agenda" | "prestasi";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: Category;
  image_url: string | null;
  author_name: string;
  featured: boolean;
  event_date: string | null;
  event_location: string | null;
  published_at: string;
};

export const CATEGORIES: Record<Category, { label: string; short: string; desc: string }> = {
  berita: { label: "Berita & Informasi Umum", short: "Berita", desc: "Kabar terbaru seputar kegiatan dan kehidupan sekolah." },
  pengumuman: { label: "Pengumuman Penting", short: "Pengumuman", desc: "Informasi resmi untuk siswa, guru, dan orang tua." },
  agenda: { label: "Agenda Kegiatan", short: "Agenda", desc: "Jadwal acara dan kegiatan sekolah yang akan datang." },
  prestasi: { label: "Prestasi Siswa & Guru", short: "Prestasi", desc: "Capaian membanggakan warga sekolah." },
};

export const isCategory = (v: string): v is Category => v in CATEGORIES;

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " WIB";

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
