import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, MAIN_SITE } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Sekolah — Warta Sekolah" },
      { name: "description", content: "Visi, misi, dan sekilas tentang sekolah kami." },
      { property: "og:title", content: "Profil Sekolah — Warta Sekolah" },
      { property: "og:description", content: "Visi, misi, dan sekilas tentang sekolah kami." },
    ],
  }),
  component: Profil,
});

function Profil() {
  return (
    <SiteLayout>
      <div className="relative">
        <img src="/images/pengumuman.jpg" alt="Gedung sekolah" className="h-72 w-full object-cover md:h-96" />
        <div className="absolute inset-0 bg-hero-fade" />
        <h1 className="absolute bottom-8 left-0 right-0 mx-auto max-w-5xl px-4 text-4xl font-bold text-primary-foreground">Profil Sekolah</h1>
      </div>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-primary">Visi</h2>
          <p className="mt-3 text-muted-foreground">Menjadi sekolah unggul yang berprestasi, berkarakter, dan berwawasan global.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">Misi</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Menyelenggarakan pembelajaran yang aktif dan inovatif.</li>
            <li>Membina karakter dan budi pekerti luhur.</li>
            <li>Mengembangkan potensi akademik dan non-akademik siswa.</li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <Button asChild size="lg"><a href={MAIN_SITE}>Kunjungi Website Utama Sekolah</a></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
