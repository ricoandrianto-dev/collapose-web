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

interface Kelompok {
  namaKelompok: string;
  anggota: Siswa[];
  soalDiberikan: Soal[];
}

export default function DashboardGuruPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ringkasan");

  // State Data Siswa (Dummy awal agak banyak untuk demonstrasi acak kelompok)
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([
    { id: "1", nama: "Elvina Ratna Puspita", nilaiTkm: 88, kategori: "Tinggi", kode: "T1" },
    { id: "2", nama: "Muhammad Fajar Aditya", nilaiTkm: 72, kategori: "Sedang", kode: "S1" },
    { id: "3", nama: "Nadia Anindya Dewanti", nilaiTkm: 55, kategori: "Rendah", kode: "R1" },
    { id: "4", nama: "Rian Hidayat", nilaiTkm: 85, kategori: "Tinggi", kode: "T2" },
    { id: "5", nama: "Siti Aminah", nilaiTkm: 78, kategori: "Sedang", kode: "S2" },
    { id: "6", nama: "Budi Santoso", nilaiTkm: 45, kategori: "Rendah", kode: "R2" },
  ]);

  // State Data Soal
  const [bankSoal, setBankSoal] = useState<Soal[]>([
    { id: "s1", kodeSoal: "SL01", materi: "Pecahan", pertanyaan: "Ibu membeli 1/2 kg telur dan 3/4 kg tepung. Berapa total berat belanjaan Ibu?", kunciJawaban: "5/4 kg atau 1 1/4 kg", sumber: "Manual" },
    { id: "s2", kodeSoal: "SL02", materi: "Volume Kubus", pertanyaan: "Sebuah kubus memiliki panjang rusuk 5 cm. Hitunglah volume kubus tersebut!", kunciJawaban: "125 cm³", sumber: "AI" }
  ]);

  // State Hasil Pembentukan Kelompok (Fitur I, J, K)
  const [hasilKelompok, setHasilKelompok] = useState<Kelompok[]>([]);
  const [jumlahKelompokTarget, setJumlahKelompokTarget] = useState("2");

  // State Form Inputs
  const [inputMateri, setInputMateri] = useState("");
  const [inputPertanyaan, setInputPertanyaan] = useState("");
  const [inputKunci, setInputKunci] = useState("");
  const [promptTopik, setPromptTopik] = useState("Pecahan Senilai");
  const [tingkatKesulitan, setTingkatKesulitan] = useState("Sedang");
  const [hasilAi, setHasilAi] = useState<{pertanyaan: string, jawaban: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
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

  // Logika Tambah Soal Manual
  const handleTambahSoalManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMateri || !inputPertanyaan || !inputKunci) return;
    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    setBankSoal([...bankSoal, { id: Date.now().toString(), kodeSoal: kodeOtomatis, materi: inputMateri, pertanyaan: inputPertanyaan, kunciJawaban: inputKunci, sumber: "Manual" }]);
    setInputMateri(""); setInputPertanyaan(""); setInputKunci(""); setActiveTab("daftar-soal");
  };

  // Simulator AI Gemini
  const handleGenerateSoalAI = () => {
    setIsAiLoading(true); setHasilAi(null);
    setTimeout(() => {
      setHasilAi({
        pertanyaan: `[Rekomendasi AI] Budi membagikan 1/2 bagian kue kepada Susi, kemudian memberikan 1/4 bagian lagi kepada Roni. Berapa sisa bagian kue milik Budi sekarang jika dikaitkan dengan konsep ${promptTopik}?`,
        jawaban: "1/4 bagian kue"
      });
      setIsAiLoading(false);
    }, 1200);
  };

  const simpanSoalDariAi = () => {
    if (!hasilAi) return;
    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    setBankSoal([...bankSoal, { id: Date.now().toString(), kodeSoal: kodeOtomatis, materi: promptTopik, pertanyaan: hasilAi.pertanyaan, kunciJawaban: hasilAi.jawaban, sumber: "AI" }]);
    setHasilAi(null); setActiveTab("daftar-soal");
  };

  // ================= UTAMA: LOGIKA ACAK KELOMPOK HETEROGEN (Fitur I) =================
  const handleAcakKelompokHeterogen = () => {
    const targetCount = parseInt(jumlahKelompokTarget);
    if (isNaN(targetCount) || targetCount <= 0 || daftarSiswa.length === 0) return;

    // 1. Pisahkan siswa berdasarkan kategori kelayakan nilainya
    const grupTinggi = [...daftarSiswa.filter(s => s.kategori === "Tinggi")].sort(() => Math.random() - 0.5);
    const grupSedang = [...daftarSiswa.filter(s => s.kategori === "Sedang")].sort(() => Math.random() - 0.5);
    const grupRendah = [...daftarSiswa.filter(s => s.kategori === "Rendah")].sort(() => Math.random() - 0.5);

    // 2. Inisialisasi wadah kelompok kosong
    const kelompokBaru: Kelompok[] = Array.from({ length: targetCount }, (_, i) => ({
      namaKelompok: `Kelompok ${String.fromCharCode(65 + i)}`, // Kelompok A, B, C...
      anggota: [],
      soalDiberikan: []
    }));

    // 3. Distribusikan secara adil dan merata (Round-Robin) agar heterogen
    let currentKlp = 0;
    grupTinggi.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });
    grupSedang.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });
    grupRendah.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });

    setHasilKelompok(kelompokBaru);
    setActiveTab("daftar-kelompok");
  };

  // ================= UTAMA: LOGIKA ACAK PEMBAGIAN SOAL (Fitur J) =================
  const handleAcakPembagianSoal = () => {
    if (hasilKelompok.length === 0 || bankSoal.length === 0) return;

    const updatedKelompok = hasilKelompok.map(klp => {
      // Ambil 1 soal secara acak dari bank soal untuk tiap kelompok
      const soalAcak = bankSoal[Math.floor(Math.random() * bankSoal.length)];
      return {
        ...klp,
        soalDiberikan: [soalAcak] // Assign soal ke kelompok
      };
    });

    setHasilKelompok(updatedKelompok);
    setActiveTab("daftar-kelompok");
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
    { id: "daftar-kelompok", label: "👪 Daftar & Anggota Kelompok", icon: "🛡️" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex antialiased">
      
      {/* SIDEBAR */}
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
            <p className="text-xs text-slate-500 mt-1">Sistem Manajemen Kelompok Diskusi Realtime</p>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[500px]">
          
          {/* TAB: RINGKASAN */}
          {activeTab === "ringkasan" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md shadow-purple-100">
                <h2 className="text-2xl font-bold">Halo, Pak Rico! 👋</h2>
                <p className="text-purple-100 text-sm mt-1">Sistem pembagian kelompok cerdas siap digunakan untuk membagi kelas secara adil dan heterogen.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase mt-2">Siswa Terdaftar</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">{daftarSiswa.length} Anak</p>
                </div>
                <div className="border p-6 rounded-2xl bg-slate-50/50">
                  <span className="text-2xl">🛡️</span>
                  <h3 className="text-slate-500 text-xs font-bold uppercase mt-2">Kelompok Aktif</h3>
                  <p className="text-2xl font-black text-purple-700 mt-1">{hasilKelompok.length} Kelompok</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INPUT SISWA */}
          {activeTab === "input-siswa" && (
            <form onSubmit={handleTambahSiswa} className="max-w-xl space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">NAMA SISWA</label>
              <input type="text" required value={inputNama} onChange={(e) => setInputNama(e.target.value)} placeholder="Nama lengkap" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">NILAI TKM</label>
              <input type="number" required value={inputNilai} onChange={(e) => setInputNilai(e.target.value)} placeholder="0 - 100" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" /></div>
              <button type="submit" className="px-5 py-3 bg-purple-600 text-white font-semibold text-sm rounded-xl">💾 Simpan Siswa</button>
            </form>
          )}

          {/* TAB: TABEL SISWA */}
          {activeTab === "daftar-siswa" && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b">
                  <tr><th className="p-4">NO</th><th className="p-4">NAMA SISWA</th><th className="p-4">NILAI</th><th className="p-4">KATEGORI</th><th className="p-4">KODE</th></tr>
                </thead>
                <tbody className="divide-y">
                  {daftarSiswa.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="p-4 text-slate-400">{idx+1}</td><td className="p-4 font-bold">{s.nama}</td><td className="p-4 font-mono">{s.nilaiTkm}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.kategori === 'Tinggi' ? 'bg-emerald-50 text-emerald-700' : s.kategori === 'Sedang' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{s.kategori}</span></td>
                      <td className="p-4 font-mono font-bold text-purple-700">{s.kode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: INPUT SOAL MANUAL */}
          {activeTab === "input-soal" && (
            <form onSubmit={handleTambahSoalManual} className="max-w-xl space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">MATERI/TOPIK</label>
              <input type="text" required value={inputMateri} onChange={(e) => setInputMateri(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">PERTANYAAN</label>
              <textarea required value={inputPertanyaan} onChange={(e) => setInputPertanyaan(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border text-sm" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600">KUNCI JAWABAN</label>
              <input type="text" required value={inputKunci} onChange={(e) => setInputKunci(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" /></div>
              <button type="submit" className="px-5 py-3 bg-purple-600 text-white font-semibold text-sm rounded-xl">💾 Daftarkan Soal</button>
            </form>
          )}

          {/* TAB: TABEL BANK SOAL AKTIF */}
          {activeTab === "daftar-soal" && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b">
                  <tr><th className="p-4">KODE</th><th className="p-4">MATERI</th><th className="p-4">SOAL</th><th className="p-4">KUNCI</th><th className="p-4">SUMBER</th></tr>
                </thead>
                <tbody className="divide-y">
                  {bankSoal.map((soal) => (
                    <tr key={soal.id}>
                      <td className="p-4 font-mono font-bold">{soal.kodeSoal}</td><td className="p-4 font-medium text-purple-700">{soal.materi}</td>
                      <td className="p-4 text-slate-700 max-w-sm">{soal.pertanyaan}</td><td className="p-4 font-mono font-semibold">{soal.kunciJawaban}</td>
                      <td className="p-4"><span className="text-[10px] font-bold bg-slate-100 p-1