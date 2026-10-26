<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public post reads go through server functions in src/lib/posts.functions.ts using a publishable client; admin writes use the browser client and are enforced by RLS via has_role. Why: SSR-safe public pages, DB-enforced permissions.
- Post images live in a private storage bucket and are stored as long-lived signed URLs. Why: workspace blocks public buckets.
