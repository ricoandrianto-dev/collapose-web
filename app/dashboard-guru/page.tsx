"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Siswa {
  id: string;
  nama: string;
  nilaiTkm: number;
  kategori: "Tinggi" | "Sedang" | "Rendah";
  kode: string;
}

interface Soal {
  id: string;
  kodeSoal: string;
  materi: string;
  pertanyaan: string;
  kunciJawaban: string;
  sumber: "Manual" | "AI";
}

export default function DashboardGuruPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ringkasan");

  // State Data Siswa
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([
    { id: "1", nama: "Elvina Ratna Puspita", nilaiTkm: 88, kategori: "Tinggi", kode: "T1" },
    { id: "2", nama: "Muhammad Fajar Aditya Nugraha", nilaiTkm: 72, kategori: "Sedang", kode: "S1" },
    { id: "3", nama: "Nadia Anindya Dewanti", nilaiTkm: 55, kategori: "Rendah", kode: "R1" },
  ]);

  // State Data Soal (Fitur F & G)
  const [bankSoal, setBankSoal] = useState<Soal[]>([
    { id: "s1", kodeSoal: "SL01", materi: "Pecahan", pertanyaan: "Ibu membeli 1/2 kg telur dan 3/4 kg tepung. Berapa total berat belanjaan Ibu?", kunciJawaban: "5/4 kg atau 1 1/4 kg", sumber: "Manual" },
    { id: "s2", kodeSoal: "SL02", materi: "Volume Bangun Ruang", pertanyaan: "Sebuah kubus memiliki panjang rusuk 5 cm. Hitunglah volume kubus tersebut!", kunciJawaban: "125 cm³", sumber: "AI" }
  ]);

  // State Form Input Soal Manual
  const [inputMateri, setInputMateri] = useState("");
  const [inputPertanyaan, setInputPertanyaan] = useState("");
  const [inputKunci, setInputKunci] = useState("");

  // State Form Generate AI (Fitur H)
  const [promptTopik, setPromptTopik] = useState("Pecahan Senilai");
  const [tingkatKesulitan, setTingkatKesulitan] = useState("Sedang");
  const [hasilAi, setHasilAi] = useState<{pertanyaan: string, jawaban: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form Input Siswa State
  const [inputNama, setInputNama] = useState("");
  const [inputNilai, setInputNilai] = useState("");

  const handleLogout = () => {
    router.push("/login-guru");
  };

  // Logika Tambah Siswa
  const handleTambahSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama || !inputNilai) return;
    const nilaiNum = parseFloat(inputNilai);
    let kategoriSiswa: "Tinggi" | "Sedang" | "Rendah" = "Sedang";
    let inisial = "S";
    if (nilaiNum >= 80) { kategoriSiswa = "Tinggi"; inisial = "T"; }
    else if (nilaiNum < 60) { kategoriSiswa = "Rendah"; inisial = "R"; }
    const jumlahSamaKategori = daftarSiswa.filter(s => s.kategori === kategoriSiswa).length;
    const kodeOtomatis = `${inisial}${jumlahSamaKategori + 1}`;
    
    setDaftarSiswa([...daftarSiswa, { id: Date.now().toString(), nama: inputNama, nilaiTkm: nilaiNum, kategori: kategoriSiswa, kode: kodeOtomatis }]);
    setInputNama(""); setInputNilai(""); setActiveTab("daftar-siswa");
  };

  // Logika Tambah Soal Manual (Fitur F)
  const handleTambahSoalManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMateri || !inputPertanyaan || !inputKunci) return;

    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    const soalBaru: Soal = {
      id: Date.now().toString(),
      kodeSoal: kodeOtomatis,
      materi: inputMateri,
      pertanyaan: inputPertanyaan,
      kunciJawaban: inputKunci,
      sumber: "Manual"
    };

    setBankSoal([...bankSoal, soalBaru]);
    setInputMateri(""); setInputPertanyaan(""); setInputKunci("");
    setActiveTab("daftar-soal");
  };

  // Simulasi Integrasi AI Gemini (Fitur H)
  const handleGenerateSoalAI = () => {
    setIsAiLoading(true);
    setHasilAi(null);

    // Simulasi respons API eksternal
    setTimeout(() => {
      setHasilAi({
        pertanyaan: `[Rekomendasi AI] Budi membagikan ${tingkatKesulitan === 'Tinggi' ? '3/4 bagian dari 2' : '1/2'} kue kepada Susi, kemudian memberikan 1/4 bagian lagi kepada Roni. Berapa sisa bagian kue milik Budi sekarang jika dikaitkan dengan konsep ${promptTopik}?`,
        jawaban: tingkatKesulitan === 'Tinggi' ? "1 1/4 bagian kue" : "1/4 bagian kue"
      });
      setIsAiLoading(false);
    }, 1500);
  };

  const simpanSoalDariAi = () => {
    if (!hasilAi) return;
    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    setBankSoal([...bankSoal, {
      id: Date.now().toString(),
      kodeSoal: kodeOtomatis,
      materi: promptTopik,
      pertanyaan: hasilAi.pertanyaan,
      kunciJawaban: hasilAi.jawaban,
      sumber: "AI"
    }]);
    setHasilAi(null);
    setActiveTab("daftar-soal");
  };

  const menuSidebar = [
    { id: "ringkasan", label: "📊 Ringkasan Kelas", icon: "🏠" },
    { id: "input-siswa", label: "➕ Input Data Siswa", icon: "👤" },
    { id: "daftar-siswa", label: "📋 Daftar & Tabel Siswa", icon: "👥" },
    { id: "input-soal", label: "📝 Input Soal Manual", icon: "✍️" },
    { id: "daftar-soal", label: "📚 Bank Soal Aktif", icon: "📖" },
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
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">Collapose</span>
          </div>
          <nav className="space-y-1">
            {menuSidebar.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id ? "bg-purple-50 text-purple-700 font-semibold shadow-sm border-l-4 border-purple-600 rounded-l-none" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>{item.icon}</span> <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 mt-auto">
          <span>🚪</span> <span>Keluar</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{menuSidebar.find((m) => m.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sistem Kendali Pembelajaran E-LKPD Matematika</p>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[500px]">
          
          {/* TAB: RINGKASAN */}
          {activeTab === "ringkasan" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md shadow-purple-100">
                <h2 className="text-2xl font-bold">Halo, Pak Rico! 👋</h2>
                <p className="text-purple-100 text-sm mt-1">Gunakan kecerdasan buatan (AI) di menu samping untuk membantu merumuskan problem posing kontekstual.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase mt-2">Total Siswa</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">{daftarSiswa.length} Orang</p>
                </div>
                <div className="border p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase mt-2">Koleksi Soal</h3>
                  <p className="text-2xl font-black text-purple-700 mt-1">{bankSoal.length} Masalah</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INPUT SISWA */}
          {activeTab === "input-siswa" && (
            <form onSubmit={handleTambahSiswa} className="max-w-xl space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">NAMA SISWA</label>
              <input type="text" required value={inputNama} onChange={(e) => setInputNama(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">NILAI TKM</label>
              <input type="number" required value={inputNilai} onChange={(e) => setInputNilai(e.target.value)} placeholder="0 - 100" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" /></div>
              <button type="submit" className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl">💾 Simpan Siswa</button>
            </form>
          )}

          {/* TAB: TABEL SISWA */}
          {activeTab === "daftar-siswa" && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b">
                  <tr><th className="p-4">NO</th><th className="p-4">NAMA SISWA</th><th className="p-4">NILAI</th><th className="p-4">KATEGORI</th><th className="p-4">KODE UNIQUENESS</th></tr>
                </thead>
                <tbody className="divide-y">
                  {daftarSiswa.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-400">{idx+1}</td><td className="p-4 font-bold">{s.nama}</td><td className="p-4 font-mono">{s.nilaiTkm}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.kategori === 'Tinggi' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{s.kategori}</span></td>
                      <td className="p-4 font-mono font-bold text-purple-700">{s.kode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: INPUT SOAL MANUAL (Fitur F) */}
          {activeTab === "input-soal" && (
            <form onSubmit={handleTambahSoalManual} className="max-w-xl space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">MATERI/TOPIK</label>
              <input type="text" required value={inputMateri} onChange={(e) => setInputMateri(e.target.value)} placeholder="Misal: Pecahan Campuran" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">PERTANYAAN MASALAH MATEMATIKA</label>
              <textarea required value={inputPertanyaan} onChange={(e) => setInputPertanyaan(e.target.value)} rows={4} placeholder="Ketikkan rumusan masalah disini..." className="w-full px-4 py-3 rounded-xl border text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">KUNCI JAWABAN/SOLUSI</label>
              <input type="text" required value={inputKunci} onChange={(e) => setInputKunci(e.target.value)} placeholder="Jawaban singkat atau angka mutlak" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" /></div>
              <button type="submit" className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md">💾 Daftarkan ke Bank Soal</button>
            </form>
          )}

          {/* TAB: TABEL BANK SOAL AKTIF (Fitur G) */}
          {activeTab === "daftar-soal" && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b">
                  <tr><th className="p-4">KODE</th><th className="p-4">MATERI</th><th className="p-4">RUMUSAN MASALAH / SOAL</th><th className="p-4">KUNCI JAWABAN</th><th className="p-4">SUMBER</th></tr>
                </thead>
                <tbody className="divide-y">
                  {bankSoal.map((soal) => (
                    <tr key={soal.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{soal.kodeSoal}</td>
                      <td className="p-4 font-medium text-purple-700">{soal.materi}</td>
                      <td className="p-4 text-slate-700 max-w-sm leading-relaxed">{soal.pertanyaan}</td>
                      <td className="p-4 font-mono font-semibold text-slate-600">{soal.kunciJawaban}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${soal.sumber === 'AI' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'}`}>
                          {soal.sumber}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: GENERATOR SOAL KECERDASAN BUATAN AI (Fitur H) */}
          {activeTab === "generate-ai" && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                <h3 className="text-sm font-bold text-purple-900 flex items-center gap-1.5">🤖 Asisten Pengembang Soal AI</h3>
                <p className="text-xs text-purple-700 mt-1">Sistem akan merumuskan draf soal problem posing menggunakan kurikulum Merdeka Kelas V secara cerdas.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">MATERI SPESIFIK</label>
                  <input type="text" value={promptTopik} onChange={(e) => setPromptTopik(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">TINGKAT KESULITAN</label>
                  <select value={tingkatKesulitan} onChange={(e) => setTingkatKesulitan(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="Mudah">Mudah (Dasar Pemahaman)</option>
                    <option value="Sedang">Sedang (Aplikasi Konseptual)</option>
                    <option value="Tinggi">Tinggi (HOTS - Analitis)</option>
                  </select>
                </div>
              </div>

              <button onClick={handleGenerateSoalAI} disabled={isAiLoading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-40">
                {isAiLoading ? "⏳ Menganalisis & Menyusun Rumusan Soal..." : "⚡ Generate Draf Soal Matematika"}
              </button>

              {/* TAMPILAN PRATINJAU HASIL GENERATE AI */}
              {hasilAi && (
                <div className="p-6 border border-indigo-100 bg-indigo-50/20 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-indigo-700 tracking-wide bg-indigo-100 px-2 py-0.5 rounded">Rekomendasi Konten AI</span></div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500">KONTEN PERTANYAAN:</h4>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{hasilAi.pertanyaan}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500">KUNCI JAWABAN:</h4>
                    <p className="text-sm font-mono font-bold text-emerald-700 bg-white p-3 rounded-xl border border-slate-100">{hasilAi.jawaban}</p>
                  </div>
                  <button onClick={simpanSoalDariAi} className="w-full py-2.5 bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-all">
                    📥 Masukkan Rekomendasi Ini ke Bank Soal Aktif
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PLACEHOLDER MENU SISA */}
          {!["ringkasan", "input-siswa", "daftar-siswa", "input-soal", "daftar-soal", "generate-ai"].includes(activeTab) && (
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