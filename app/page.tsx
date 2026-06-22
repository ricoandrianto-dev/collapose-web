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
    <div className="min-h-screen bg-gradient-to-tr from-[#f3f0ff] via-[#f8fafc] to-[#e0e7ff] text-slate-800 antialiased font-sans flex flex-col relative overflow-hidden">
      
      {/* Dekorasi Estetik Gradasi Latar Belakang (Style ala Gambar 1 & 3) */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-200">
            C
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
            Collapose
          </span>
        </div>
        
        {/* Tombol Login Guru di Kanan Atas */}
        <Link href="/login-guru">
          <button className="px-5 py-2.5 rounded-xl border border-purple-200 bg-white/70 hover:bg-purple-50 text-purple-700 font-medium text-sm transition-all duration-200 active:scale-95 backdrop-blur-sm shadow-sm">
            👨‍🏫 Login Guru
          </button>
        </Link>
      </header>

      {/* HERO SECTION CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-8">
        
        {/* SISI KIRI: JUDUL & DESKRIPSI WEBSITE */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-xs font-semibold text-purple-800 tracking-wide backdrop-blur-sm">
            ✨ E-LKPD Matematika Kelas V
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Collaborative <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Problem Posing
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Aplikasi lembar kerja digital interaktif berbasis kelompok untuk melatih kemampuan kolaborasi, diskusi, dan pengajuan masalah matematika secara realtime.
          </p>
        </div>

        {/* SISI KANAN: FORM PILIH KELOMPOK (CARD INTERAKTIF) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl shadow-purple-100/50 space-y-6">
            <div className="text-center lg:text-left space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Masuk Kelas</h2>
              <p className="text-xs text-slate-500">Silakan pilih identitas kelompokmu untuk bergabung ke ruang kerja.</p>
            </div>

            <div className="space-y-4">
              {/* Dropdown 1: Pilih Kelompok */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 tracking-wide block">PILIH KELOMPOK</label>
                <select
                  value={kelompokTerpilih}
                  onChange={(e) => setKelompokTerpilih(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition-all outline-none"
                >
                  <option value="">-- Pilih Kelompok --</option>
                  {Object.keys(DATA_KELOMPOK_AWAR).map((klp) => (
                    <option key={klp} value={klp}>{klp}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Pilih Nama Siswa */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 tracking-wide block">NAMA ANGGOTA SISWA</label>
                <select
                  value={siswaTerpilih}
                  onChange={(e) => setSiswaTerpilih(e.target.value)}
                  disabled={!kelompokTerpilih}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition-all outline-none"
                >
                  <option value="">-- Pilih Nama Kamu --</option>
                  {daftarSiswa.map((sw) => (
                    <option key={sw.nama} value={sw.nama}>
                      {sw.nama} ({sw.kode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tombol Join Kelas */}
            <button
              disabled={!tombolJoinAktif}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 shadow-md transform active:scale-95 ${
                tombolJoinAktif
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              🚀 Masuk ke Ruang Kelompok
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}