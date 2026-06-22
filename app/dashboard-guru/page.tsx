"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Interface data struktur siswa
interface Siswa {
  id: string;
  nama: string;
  nilaiTkm: number;
  kategori: "Tinggi" | "Sedang" | "Rendah";
  kode: string;
}

export default function DashboardGuruPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ringkasan");

  // State Utama untuk menampung data siswa secara dinamis
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([
    { id: "1", nama: "Elvina Ratna Puspita", nilaiTkm: 88, kategori: "Tinggi", kode: "T1" },
    { id: "2", nama: "Muhammad Fajar Aditya Nugraha", nilaiTkm: 72, kategori: "Sedang", kode: "S1" },
    { id: "3", nama: "Nadia Anindya Dewanti", nilaiTkm: 55, kategori: "Rendah", kode: "R1" },
  ]);

  // State Form Input Siswa Baru
  const [inputNama, setInputNama] = useState("");
  const [inputNilai, setInputNilai] = useState("");

  const handleLogout = () => {
    router.push("/login-guru");
  };

  // Fungsi Tambah Siswa Otomatis Kategori & Kode
  const handleTambahSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama || !inputNilai) return;

    const nilaiNum = parseFloat(inputNilai);
    
    // 1. Logika Penentuan Kategori Berdasarkan Nilai TKM
    let kategoriSiswa: "Tinggi" | "Sedang" | "Rendah" = "Sedang";
    let inisial = "S";
    if (nilaiNum >= 80) {
      kategoriSiswa = "Tinggi";
      inisial = "T";
    } else if (nilaiNum < 60) {
      kategoriSiswa = "Rendah";
      inisial = "R";
    }

    // 2. Logika Pembuatan Kode Unik Otomatis (T1, T2, S1, dst.)
    const jumlahSamaKategori = daftarSiswa.filter(s => s.kategori === kategoriSiswa).length;
    const kodeOtomatis = `${inisial}${jumlahSamaKategori + 1}`;

    const siswaBaru: Siswa = {
      id: Date.now().toString(),
      nama: inputNama,
      nilaiTkm: nilaiNum,
      kategori: kategoriSiswa,
      kode: kodeOtomatis
    };

    setDaftarSiswa([...daftarSiswa, siswaBaru]);
    setInputNama("");
    setInputNilai("");
    
    // Alihkan langsung ke tab daftar siswa setelah input berhasil
    setActiveTab("daftar-siswa");
  };

  const handleHapusSiswa = (id: string) => {
    setDaftarSiswa(daftarSiswa.filter(s => s.id !== id));
  };

  const menuSidebar = [
    { id: "ringkasan", label: "📊 Ringkasan Kelas", icon: "🏠" },
    { id: "input-siswa", label: "➕ Input Data Siswa", icon: "👤" },
    { id: "daftar-siswa", label: "📋 Daftar & Tabel Siswa", icon: "👥" },
    { id: "input-soal", label: "📝 Input Soal", icon: "✍️" },
    { id: "daftar-soal", label: "📚 Daftar Soal", icon: "📖" },
    { id: "generate-ai", label: "🤖 Generate Soal AI", icon: "⚡" },
    { id: "acak-siswa", label: "🔀 Acak Kelompok Siswa", icon: "🎲" },
    { id: "acak-soal", label: "🎲 Acak Pembagian Soal", icon: "🎯" },
    { id: "daftar-kelompok", label: "👪 Daftar Kelompok", icon: "🛡️" },
    { id: "bank-soal", label: "🏦 Menuju Bank Soal", icon: "🏛️" },
    { id: "api-setting", label: "🔑 API Gemini Setting", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex antialiased">
      
      {/* SIDEBAR NAV */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
              Collapose <span className="text-xs font-normal text-slate-400">Guru</span>
            </span>
          </div>

          <nav className="space-y-1">
            {menuSidebar.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-purple-50 text-purple-700 font-semibold shadow-sm border-l-4 border-purple-600 rounded-l-none"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-auto">
          <span>🚪</span>
          <span>Keluar (Logout)</span>
        </button>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {menuSidebar.find((m) => m.id === activeTab)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Sistem Manajemen E-LKPD Terintegrasi.</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 font-bold flex items-center justify-center text-xs">👨‍🏫</div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">Rico Andrianto, S.Pd.</p>
              <p className="text-[10px] text-slate-400 font-medium">Guru Kelas V Matematika</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[500px]">
          
          {/* TAB 1: RINGKASAN */}
          {activeTab === "ringkasan" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-purple-100">
                <h2 className="text-2xl font-bold">Halo, Selamat Datang Pak Rico! 👋</h2>
                <p className="text-purple-100 text-sm mt-1">Kelola data siswa, pembagian kelompok otomatis, dan pembuatan bank soal matematika berbasis AI di sini.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">Total Siswa Terdata</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">{daftarSiswa.length} Siswa</p>
                </div>
                <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">Kategori Tinggi (T)</h3>
                  <p className="text-2xl font-black text-purple-700 mt-1">{daftarSiswa.filter(s => s.kategori === "Tinggi").length} Siswa</p>
                </div>
                <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">Kategori Rendah (R)</h3>
                  <p className="text-2xl font-black text-pink-600 mt-1">{daftarSiswa.filter(s => s.kategori === "Rendah").length} Siswa</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INPUT DATA SISWA */}
          {activeTab === "input-siswa" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Formulir Pendaftaran Siswa Baru</h2>
                <p className="text-xs text-slate-500">Sistem akan otomatis menentukan kategori kelayakan (T/S/R) dan nomor kodenya.</p>
              </div>

              <form onSubmit={handleTambahSiswa} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">NAMA LENGKAP SISWA</label>
                  <input
                    type="text"
                    required
                    value={inputNama}
                    onChange={(e) => setInputNama(e.target.value)}
                    placeholder="Contoh: Rico Andrianto"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">NILAI TKM (TES KEMAMPUAN MATEMATIKA)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={inputNilai}
                    onChange={(e) => setInputNilai(e.target.value)}
                    placeholder="Skala nilai 0 - 100"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm outline-none"
                  />
                </div>

                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95">
                  💾 Simpan & Hitung Kode Otomatis
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DAFTAR & TABEL SISWA */}
          {activeTab === "daftar-siswa" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Database Urutan Kode Kelayakan Siswa</h2>
                <p className="text-xs text-slate-500">Berikut adalah daftar lengkap siswa beserta nilai dan pembagian kategori kodenya.</p>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs tracking-wider">
                      <th className="p-4">NO</th>
                      <th className="p-4">NAMA SISWA</th>
                      <th className="p-4">NILAI TKM</th>
                      <th className="p-4">KATEGORI KELOMPOK</th>
                      <th className="p-4">KODE OTOMATIS</th>
                      <th className="p-4 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {daftarSiswa.map((siswa, idx) => (
                      <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-900">{siswa.nama}</td>
                        <td className="p-4 font-mono font-semibold text-slate-700">{siswa.nilaiTkm}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            siswa.kategori === "Tinggi" ? "bg-emerald-50 text-emerald-700" :
                            siswa.kategori === "Sedang" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                          }`}>
                            {siswa.kategori}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-purple-700 bg-purple-50/40 text-center rounded-md">{siswa.kode}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleHapusSiswa(siswa.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            ❌ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {daftarSiswa.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">Belum ada data siswa. Silakan klik tab "Input Data Siswa" untuk menambahkan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB LAINNYA (DUMMY PLACEHOLDER) */}
          {!["ringkasan", "input-siswa", "daftar-siswa"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center text-center py-20 space-y-3">
              <div className="text-4xl">🛠️</div>
              <h3 className="text-lg font-bold text-slate-800">Komponen Sedang Kita Bangun</h3>
              <p className="text-sm text-slate-400 max-w-md">Menu "{menuSidebar.find(m => m.id === activeTab)?.label}" siap dikonfigurasi pada tahap berikutnya.</p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}