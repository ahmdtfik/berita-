import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PostCard } from "@/components/site/PostCard";
import { postsQuery } from "@/lib/posts.functions";
import { CATEGORIES, isCategory, type Category } from "@/lib/posts";

export const Route = createFileRoute("/kategori/$category")({
  loader: ({ context, params }) => {
    if (!isCategory(params.category)) throw notFound();
    return context.queryClient.ensureQueryData(postsQuery(params.category));
  },
  head: ({ params }) => {
    const c = isCategory(params.category) ? CATEGORIES[params.category] : null;
    const title = c ? `${c.label} — Warta Sekolah` : "Kategori — Warta Sekolah";
    return { meta: [{ title }, { name: "description", content: c?.desc ?? "" }, { property: "og:title", content: title }, { property: "og:description", content: c?.desc ?? "" }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const category = Route.useParams().category as Category;
  const { data: posts } = useSuspenseQuery(postsQuery(category));
  const meta = CATEGORIES[category];
  return (
    <SiteLayout>
      <div className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Kategori</div>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{meta.label}</h1>
          <p className="mt-2 text-primary-foreground/75">{meta.desc}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex gap-2 overflow-x-auto py-6">
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <Link key={c} to="/kategori/$category" params={{ category: c }} className="whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium hover:border-primary data-[status=active]:border-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">
              {CATEGORIES[c].short}
            </Link>
          ))}
        </div>
        {posts.length === 0 ? <p className="py-20 text-center text-muted-foreground">Belum ada postingan di kategori ini.</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </div>
    </SiteLayout>
  );
}
