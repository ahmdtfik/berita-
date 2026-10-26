import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { CATEGORIES, formatDate, formatDateTime, type Post } from "@/lib/posts";

export function CategoryBadge({ category }: { category: Post["category"] }) {
  return (
    <span className="inline-block rounded-sm bg-gold px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-foreground">
      {CATEGORIES[category].short}
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link to="/berita/$slug" params={{ slug: post.slug }} className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
        {post.category === "agenda" && post.event_date && (
          <div className="mt-auto space-y-1 border-t pt-3 text-xs text-primary">
            <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDateTime(post.event_date)}</div>
            {post.event_location && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{post.event_location}</div>}
          </div>
        )}
      </div>
    </Link>
  );
}
