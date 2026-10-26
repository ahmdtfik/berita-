create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

-- first registered user becomes admin
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create type public.post_category as enum ('berita','pengumuman','agenda','prestasi');
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null default '',
  category post_category not null default 'berita',
  image_url text,
  author_name text not null default 'Admin Sekolah',
  featured boolean not null default false,
  event_date timestamptz,
  event_location text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "public read posts" on public.posts for select to anon, authenticated using (true);
create policy "admin insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "public read post images" on storage.objects for select using (bucket_id='post-images');
create policy "admin upload post images" on storage.objects for insert to authenticated with check (bucket_id='post-images' and public.has_role(auth.uid(),'admin'));
create policy "admin delete post images" on storage.objects for delete to authenticated using (bucket_id='post-images' and public.has_role(auth.uid(),'admin'));

insert into public.posts (slug,title,excerpt,content,category,image_url,author_name,featured,event_date,event_location,published_at) values
('siswa-raih-medali-emas-osn','Siswa Kami Raih Medali Emas Olimpiade Sains Nasional 2026','Prestasi membanggakan di bidang Matematika tingkat nasional.','Dengan penuh rasa syukur, sekolah mengumumkan bahwa salah satu siswa terbaik kami berhasil meraih medali emas pada Olimpiade Sains Nasional 2026 bidang Matematika.

Persiapan dilakukan selama lebih dari enam bulan dengan bimbingan intensif dari para guru pembina. Kompetisi diikuti oleh ratusan peserta dari seluruh provinsi di Indonesia.

Kepala sekolah menyampaikan apresiasi setinggi-tingginya dan berharap prestasi ini menjadi motivasi bagi seluruh siswa.','prestasi','/images/prestasi.jpg','Humas Sekolah',true,null,null,now() - interval '1 day'),
('penerimaan-peserta-didik-baru','Pembukaan Penerimaan Peserta Didik Baru Tahun Ajaran 2027/2028','Pendaftaran dibuka mulai 1 November melalui jalur zonasi, prestasi, dan afirmasi.','Sekolah membuka Penerimaan Peserta Didik Baru (PPDB) untuk tahun ajaran 2027/2028.

Pendaftaran dapat dilakukan secara daring mulai 1 November hingga 15 Desember 2026. Calon peserta didik diharapkan menyiapkan dokumen: akta kelahiran, kartu keluarga, rapor, dan pas foto terbaru.

Informasi lebih lanjut dapat ditanyakan ke bagian tata usaha pada jam kerja.','pengumuman','/images/pengumuman.jpg','Tata Usaha',false,null,null,now() - interval '2 day'),
('pentas-seni-akhir-semester','Pentas Seni dan Budaya Akhir Semester','Kreativitas siswa dalam tari, musik, dan teater ditampilkan di aula utama.','Pentas Seni dan Budaya akan menampilkan karya terbaik siswa dari seluruh kelas, mulai dari tari tradisional, paduan suara, hingga pertunjukan teater.

Orang tua dan masyarakat umum dipersilakan hadir. Acara terbuka dan tidak dipungut biaya.','agenda','/images/agenda.jpg','OSIS',false,now() + interval '14 day','Aula Utama Sekolah',now() - interval '3 day'),
('kegiatan-literasi-pagi','Gerakan Literasi Pagi Tingkatkan Minat Baca Siswa','Setiap pagi, 15 menit sebelum pelajaran dimulai digunakan untuk membaca bersama.','Program Gerakan Literasi Sekolah kini berjalan setiap hari. Siswa membaca buku non-pelajaran selama 15 menit sebelum jam pertama.

Perpustakaan sekolah juga menambah lebih dari 500 judul buku baru untuk mendukung program ini.','berita','/images/berita.jpg','Admin Sekolah',false,null,null,now() - interval '4 day'),
('jadwal-ujian-akhir-semester','Jadwal Penilaian Akhir Semester Ganjil','Penilaian akhir semester dilaksanakan mulai 1 Desember 2026.','Diberitahukan kepada seluruh siswa bahwa Penilaian Akhir Semester (PAS) ganjil akan dilaksanakan pada 1–8 Desember 2026. Siswa wajib hadir 15 menit sebelum ujian dimulai dan membawa kartu ujian.','pengumuman','/images/pengumuman.jpg','Kurikulum',false,null,null,now() - interval '5 day'),
('guru-terbaik-provinsi','Guru Kami Terpilih sebagai Guru Berprestasi Tingkat Provinsi','Penghargaan atas inovasi pembelajaran berbasis proyek.','Salah satu guru kami terpilih sebagai Guru Berprestasi tingkat provinsi berkat inovasi pembelajaran berbasis proyek yang diterapkan di kelas.','prestasi','/images/prestasi.jpg','Humas Sekolah',false,null,null,now() - interval '6 day'),
('rapat-orang-tua-siswa','Rapat Koordinasi Orang Tua dan Wali Murid','Membahas program sekolah semester depan.','Seluruh orang tua/wali murid diundang hadir dalam rapat koordinasi untuk membahas program sekolah dan evaluasi semester.','agenda','/images/agenda.jpg','Komite Sekolah',false,now() + interval '7 day','Ruang Serbaguna',now() - interval '6 day'),
('bakti-sosial-ramadan','Bakti Sosial: Siswa Berbagi dengan Warga Sekitar','OSIS menyalurkan 300 paket sembako.','OSIS bersama guru menyalurkan 300 paket sembako kepada warga sekitar sekolah sebagai wujud kepedulian sosial.','berita','/images/berita.jpg','OSIS',false,null,null,now() - interval '8 day');