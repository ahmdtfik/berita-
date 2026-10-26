import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { GraduationCap, Menu, X, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/kategori/$category", params: { category: "berita" }, label: "Berita" },
  { to: "/kategori/$category", params: { category: "pengumuman" }, label: "Pengumuman" },
  { to: "/kategori/$category", params: { category: "agenda" }, label: "Agenda Kegiatan" },
  { to: "/kategori/$category", params: { category: "prestasi" }, label: "Prestasi Siswa" },
  { to: "/profil", label: "Profil Sekolah" },
] as const;

export const MAIN_SITE = "https://wrth.my.id";

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {NAV.map((n) => {
        const cls = "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary data-[status=active]:text-primary data-[status=active]:font-semibold";
        return "params" in n ? (
          <Link key={n.label} to="/kategori/$category" params={n.params} onClick={onClick} className={cls}>{n.label}</Link>
        ) : (
          <Link key={n.label} to={n.to} onClick={onClick} activeOptions={{ exact: true }} className={cls}>{n.label}</Link>
        );
      })}
    </>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-navy-deep text-primary-foreground/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span>Portal Berita & Informasi Resmi Sekolah</span>
          <a href={MAIN_SITE} className="hover:text-gold">Website Utama →</a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-gold"><GraduationCap className="h-6 w-6" /></span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-primary">Warta Sekolah</span>
              <span className="block text-[11px] uppercase tracking-widest text-muted-foreground">berita.wrth.my.id</span>
            </span>
          </Link>
          <nav className="hidden items-center lg:flex"><NavLinks /></nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/admin">Login Admin</Link></Button>
            <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col border-t px-4 py-3 lg:hidden">
            <NavLinks onClick={() => setOpen(false)} />
            <Button asChild size="sm" className="mt-2"><Link to="/admin" onClick={() => setOpen(false)}>Login Admin</Link></Button>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 bg-navy-deep text-primary-foreground/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-bold text-primary-foreground">Warta Sekolah</div>
            <p className="mt-3 text-sm">Portal resmi berita, pengumuman, agenda, dan prestasi warga sekolah.</p>
            <a href={MAIN_SITE} className="mt-4 inline-block text-sm font-semibold text-gold hover:underline">← Kembali ke Website Utama Sekolah</a>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">Kontak</div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />Jl. Pendidikan No. 1, Indonesia</li>
              <li className="flex gap-2"><Phone className="h-4 w-4" />(021) 000-0000</li>
              <li className="flex gap-2"><Mail className="h-4 w-4" />info@wrth.my.id</li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">Media Sosial</div>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/20 hover:border-gold hover:text-gold"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 py-4 text-center text-xs">© {new Date().getFullYear()} Warta Sekolah. Hak cipta dilindungi.</div>
      </footer>
    </div>
  );
}
