import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, User, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryBadge, PostCard } from "@/components/site/PostCard";
import { postQuery } from "@/lib/posts.functions";
import { CATEGORIES, formatDate, formatDateTime } from "@/lib/posts";

export const Route = createFileRoute("/berita/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!res.post) throw notFound();
    return { title: res.post.title, excerpt: res.post.excerpt };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Warta Sekolah` : "Artikel tidak ditemukan";
    const desc = loaderData?.excerpt ?? "Berita dan informasi sekolah.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }] };
  },
  notFoundComponent: () => (
    <SiteLayout><div className="py-32 text-center"><h1 className="text-3xl font-bold">Artikel tidak ditemukan</h1><Link to="/" className="mt-4 inline-block text-primary">Kembali ke beranda</Link></div></SiteLayout>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post!;
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 pt-10">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Beranda</Link> /{" "}
          <Link to="/kategori/$category" params={{ category: post.category }} className="hover:text-primary">{CATEGORIES[post.category].short}</Link>
        </nav>
        <CategoryBadge category={post.category} />
        <h1 className="mt-3 text-3xl font-bold leading-tight text-primary md:text-5xl">{post.title}</h1>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b pb-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author_name}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatDate(post.published_at)}</span>
        </div>
        {post.image_url && <img src={post.image_url} alt={post.title} className="mt-6 w-full rounded-xl object-cover" />}
        {post.category === "agenda" && post.event_date && (
          <div className="mt-6 grid gap-3 rounded-xl border-l-4 border-gold bg-accent/60 p-5 sm:grid-cols-2">
            <div className="flex gap-3"><CalendarDays className="text-primary" /><div><div className="text-xs uppercase text-muted-foreground">Waktu Acara</div><div className="font-semibold">{formatDateTime(post.event_date)}</div></div></div>
            {post.event_location && <div className="flex gap-3"><MapPin className="text-primary" /><div><div className="text-xs uppercase text-muted-foreground">Lokasi</div><div className="font-semibold">{post.event_location}</div></div></div>}
          </div>
        )}
        <div className="prose-article mt-8 text-foreground/90">
          {post.content.split(/\n\s*\n/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
        </div>
      </article>
      {data.related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <h2 className="mb-6 border-b-2 border-primary pb-2 text-2xl font-bold text-primary">Berita Terkait</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.related.map((p) => <PostCard key={p.id} post={p} />)}</div>
        </section>
      )}
    </SiteLayout>
  );
}
