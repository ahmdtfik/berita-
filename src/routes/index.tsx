import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryBadge, PostCard } from "@/components/site/PostCard";
import { postsQuery } from "@/lib/posts.functions";
import { CATEGORIES, formatDate, formatDateTime, type Category } from "@/lib/posts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warta Sekolah — Portal Berita & Informasi Sekolah" },
      { name: "description", content: "Berita terbaru, pengumuman penting, agenda kegiatan, dan prestasi siswa & guru." },
      { property: "og:title", content: "Warta Sekolah — Portal Berita & Informasi Sekolah" },
      { property: "og:description", content: "Berita terbaru, pengumuman, agenda, dan prestasi warga sekolah." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery()),
  component: Home,
});

function Home() {
  const { data: posts } = useSuspenseQuery(postsQuery());
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const others = posts.filter((p) => p.id !== featured?.id);
  const side = others.slice(0, 3);
  const agenda = posts.filter((p) => p.category === "agenda" && p.event_date).sort((a, b) => a.event_date!.localeCompare(b.event_date!)).slice(0, 4);
  const pengumuman = posts.filter((p) => p.category === "pengumuman").slice(0, 4);

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 lg:grid-cols-3">
        {featured ? (
          <Link to="/berita/$slug" params={{ slug: featured.slug }} className="group relative overflow-hidden rounded-xl lg:col-span-2">
            {featured.image_url && <img src={featured.image_url} alt={featured.title} className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-hero-fade" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <div className="mb-3 flex items-center gap-3"><CategoryBadge category={featured.category} /><span className="text-xs font-semibold uppercase tracking-widest text-gold">Sedang Hangat</span></div>
              <h1 className="max-w-3xl text-2xl font-bold leading-tight text-primary-foreground md:text-4xl">{featured.title}</h1>
              {featured.excerpt && <p className="mt-3 hidden max-w-2xl text-primary-foreground/80 md:block">{featured.excerpt}</p>}
              <div className="mt-4 text-sm text-primary-foreground/70">{featured.author_name} · {formatDate(featured.published_at)}</div>
            </div>
          </Link>
        ) : <div className="rounded-xl border p-10 text-muted-foreground lg:col-span-2">Belum ada berita.</div>}
        <div className="flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Terbaru</div>
          {side.map((p) => (
            <Link key={p.id} to="/berita/$slug" params={{ slug: p.slug }} className="group flex gap-4 border-b pb-4 last:border-0">
              {p.image_url && <img src={p.image_url} alt="" loading="lazy" className="h-20 w-28 shrink-0 rounded-md object-cover" />}
              <div>
                <CategoryBadge category={p.category} />
                <h3 className="mt-1.5 line-clamp-2 font-semibold leading-snug group-hover:text-primary">{p.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(p.published_at)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionTitle title="Berita Pilihan" category="berita" />
          <div className="grid gap-6 sm:grid-cols-2">{others.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)}</div>
        </div>
        <aside className="space-y-8">
          <div className="rounded-xl bg-primary p-6 text-primary-foreground">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Agenda Mendatang</h2><CalendarDays className="text-gold" /></div>
            <ul className="space-y-4">
              {agenda.length === 0 && <li className="text-sm text-primary-foreground/70">Belum ada agenda.</li>}
              {agenda.map((a) => (
                <li key={a.id}>
                  <Link to="/berita/$slug" params={{ slug: a.slug }} className="flex gap-3 hover:text-gold">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-gold text-gold-foreground">
                      <span className="text-lg font-bold leading-none">{new Date(a.event_date!).getDate()}</span>
                      <span className="text-[10px] uppercase">{new Date(a.event_date!).toLocaleDateString("id-ID", { month: "short" })}</span>
                    </div>
                    <div><div className="font-semibold leading-snug">{a.title}</div><div className="text-xs text-primary-foreground/70">{formatDateTime(a.event_date!)}</div></div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border bg-accent/50 p-6">
            <h2 className="mb-4 text-xl font-bold text-primary">Pengumuman</h2>
            <ul className="divide-y">
              {pengumuman.map((p) => (
                <li key={p.id} className="py-3"><Link to="/berita/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary">{p.title}</Link><div className="text-xs text-muted-foreground">{formatDate(p.published_at)}</div></li>
              ))}
            </ul>
            <Link to="/kategori/$category" params={{ category: "pengumuman" }} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">Lihat semua <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </aside>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <SectionTitle title="Prestasi Siswa & Guru" category="prestasi" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.filter((p) => p.category === "prestasi").slice(0, 3).map((p) => <PostCard key={p.id} post={p} />)}</div>
      </section>
    </SiteLayout>
  );
}

function SectionTitle({ title, category }: { title: string; category: Category }) {
  return (
    <div className="mb-6 flex items-end justify-between border-b-2 border-primary pb-2">
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <Link to="/kategori/$category" params={{ category }} className="text-sm font-semibold text-muted-foreground hover:text-primary">Semua {CATEGORIES[category].short} →</Link>
    </div>
  );
}
