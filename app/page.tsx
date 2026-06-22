"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Data awal kelompok dan siswa sesuai dokumen konsep E-LKPD
const DATA_KELOMPOK_AWAR = {
  "Kelompok 1": [
    { nama: "Elvina Ratna Puspita", kode: "T1", kategori: "Tinggi" },
    { nama: "Muhammad Fajar Aditya Nugraha", kode: "S1", kategori: "Sedang" },
    { nama: "Nadia Anindya Dewanti", kode: "R1", kategori: "Rendah" }
  ],
  "Kelompok 2": [
    { nama: "Daffa Nur Aditya", kode: "T2", kategori: "Tinggi" },
    { nama: "Citra Putri Ayuningtyas", kode: "S2", kategori: "Sedang" },
    { nama: "Hendra Arif Hidayat", kode: "R2", kategori: "Rendah" }
  ],
  "Kelompok 3": [
    { nama: "Nasywa Elina Ekaputri", kode: "SS11", kategori: "Sedang" },
    { nama: "Rina Handayani Wulandar", kode: "SS12", kategori: "Sedang" },
    { nama: "Mutia Anindya", kode: "SS13", kategori: "Sedang" }
  ],
  "Kelompok 4": [
    { nama: "Aulia Gustina", kode: "SS21", kategori: "Sedang" },
    { nama: "Arum Oktarina", kode: "SS22", kategori: "Sedang" },
    { nama: "Vania Azzahra Dinda", kode: "SS23", kategori: "Sedang" }
  ]
};

export default function HomePage() {
  const [kelompokTerpilih, setKelompokTerpilih] = useState("");
  const [siswaTerpilih, setSiswaTerpilih] = useState("");
  const [daftarSiswa, setDaftarSiswa] = useState<{ nama: string; kode: string; kategori: string }[]>([]);

  // Perbarui daftar siswa ketika kelompok dipilih
  useEffect(() => {
    if (kelompokTerpilih) {
      const siswa = DATA_KELOMPOK_AWAR[kelompokTerpilih as keyof typeof DATA_KELOMPOK_AWAR] || [];
      setDaftarSiswa(siswa);
      setSiswaTerpilih(""); // Reset siswa jika kelompok ganti
    } else {
      setDaftarSiswa([]);
    }
  }, [kelompokTerpilih]);

  const tombolJoinAktif = kelompokTerpilih !== "" && siswaTerpilih !== "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-violet-100 text-slate-900 antialiased font-sans">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-xl shadow-purple-200/40">C</div>
          <div>
            <p className="text-lg font-bold text-slate-900">Collapose</p>
            <p className="text-sm text-slate-500">E-LKPD kolaboratif yang menarik untuk siswa dan guru.</p>
          </div>
        </div>
        <Link href="/login-guru">
          <button className="rounded-3xl border border-white/80 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-violet-50">
            👨‍🏫 Login Guru
          </button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-8">
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-10 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
            <span className="inline-flex rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-violet-700">✨ E-LKPD Interaktif</span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-950">Collapose untuk <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Pembelajaran Kolaboratif</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">Aplikasi lembar kerja digital berbasis kelompok yang memudahkan siswa berdiskusi, berbagi jawaban, dan mengerjakan tugas matematika dengan gaya modern.</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white bg-slate-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Popular</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">Tampilan dashboard rapi dan mudah dinavigasi.</p>
              </div>
              <div className="rounded-3xl border border-white bg-slate-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ongoing</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">Pembagian kelompok realtime sekaligus bank soal.</p>
              </div>
              <div className="rounded-3xl border border-white bg-slate-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Best Sales</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">Aman untuk kelas dan cepat untuk penggunaan harian.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/30">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Popular</p>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Desain Bersahabat</h2>
              <p className="mt-3 text-sm text-slate-600">Interface cerah dan mudah dipahami siswa.</p>
            </div>
            <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/30">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ongoing</p>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Real-time Collaboration</h2>
              <p className="mt-3 text-sm text-slate-600">Jawaban tim tersimpan langsung untuk semua anggota.</p>
            </div>
            <div className="hidden xl:block rounded-3xl border border-white bg-white/90 p-6 shadow-lg shadow-slate-200/30">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Best Sales</p>
              <h2 className="mt-4 text-lg font-bold text-slate-900">Fitur Lengkap</h2>
              <p className="mt-3 text-sm text-slate-600">Kelas, kelompok, dan soal dalam satu dashboard terpadu.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/95 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-semibold">Masuk Kelas</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Pilih identitas kelompokmu</h2>
            </div>
            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pilih Kelompok</label>
                  <select
                    value={kelompokTerpilih}
                    onChange={(e) => setKelompokTerpilih(e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">-- Pilih Kelompok --</option>
                    {Object.keys(DATA_KELOMPOK_AWAR).map((klp) => (
                      <option key={klp} value={klp}>{klp}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pilih Nama</label>
                  <select
                    value={siswaTerpilih}
                    onChange={(e) => setSiswaTerpilih(e.target.value)}
                    disabled={!kelompokTerpilih}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">-- Pilih Nama Kamu --</option>
                    {daftarSiswa.map((sw) => (
                      <option key={sw.nama} value={sw.nama}>{sw.nama} ({sw.kode})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              disabled={!tombolJoinAktif}
              className={`w-full rounded-3xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ${
                tombolJoinAktif ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200/40" : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              🚀 Masuk ke Ruang Kelompok
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}