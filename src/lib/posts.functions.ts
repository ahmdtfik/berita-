import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Category, Post } from "./posts";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: Category | undefined; limit?: number | undefined }) => input)
  .handler(async ({ data }) => {
    let q = publicClient().from("posts").select("*").order("published_at", { ascending: false }).limit(data.limit ?? 50);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Post[];
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post } = await sb.from("posts").select("*").eq("slug", data.slug).maybeSingle();
    if (!post) return { post: null, related: [] as Post[] };
    const { data: related } = await sb
      .from("posts").select("*").eq("category", post.category).neq("id", post.id)
      .order("published_at", { ascending: false }).limit(3);
    return { post: post as Post, related: (related ?? []) as Post[] };
  });

export const postsQuery = (category?: Category) =>
  queryOptions({ queryKey: ["posts", category ?? "all"], queryFn: () => listPosts({ data: { category } }) });

export const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["post", slug], queryFn: () => getPostBySlug({ data: { slug } }) });
