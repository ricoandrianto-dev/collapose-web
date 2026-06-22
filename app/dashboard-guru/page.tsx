"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../lib/firebase";
import { ref, set, push, onValue, remove } from "firebase/database";

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

  // State Utama aplikasi yang disinkronkan ke Firebase
  const [daftarSiswa, setDaftarSiswa] = useState<Siswa[]>([]);
  const [bankSoal, setBankSoal] = useState<Soal[]>([]);
  const [hasilKelompok, setHasilKelompok] = useState<Kelompok[]>([]);

  // State Form Inputs
  const [jumlahKelompokTarget, setJumlahKelompokTarget] = useState("2");
  const [inputMateri, setInputMateri] = useState("");
  const [inputPertanyaan, setInputPertanyaan] = useState("");
  const [inputKunci, setInputKunci] = useState("");
  const [promptTopik, setPromptTopik] = useState("Pecahan Senilai");
  const [tingkatKesulitan, setTingkatKesulitan] = useState("Sedang");
  const [hasilAi, setHasilAi] = useState<{pertanyaan: string, jawaban: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [inputNama, setInputNama] = useState("");
  const [inputNilai, setInputNilai] = useState("");

  // ================= 1. SYNC DATA REALTIME DARI FIREBASE =================
  useEffect(() => {
    // Sinkronisasi Data Siswa
    const siswaRef = ref(db, "siswa");
    const unsubscribeSiswa = onValue(siswaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listSiswa = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setDaftarSiswa(listSiswa);
      } else {
        setDaftarSiswa([]);
      }
    });

    // Sinkronisasi Bank Soal
    const soalRef = ref(db, "soal");
    const unsubscribeSoal = onValue(soalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listSoal = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setBankSoal(listSoal);
      } else {
        setBankSoal([]);
      }
    });

    // Sinkronisasi Hasil Kelompok
    const kelompokRef = ref(db, "kelompok");
    const unsubscribeKelompok = onValue(kelompokRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHasilKelompok(data);
      } else {
        setHasilKelompok([]);
      }
    });

    return () => {
      unsubscribeSiswa();
      unsubscribeSoal();
      unsubscribeKelompok();
    };
  }, []);

  const handleLogout = () => {
    router.push("/login-guru");
  };

  // ================= 2. OPERASI SIMPAN KE FIREBASE =================
  
  // Tambah Siswa Baru ke Firebase
  const handleTambahSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama || !inputNilai) return;
    const nilaiNum = parseFloat(inputNilai);
    let kategoriSiswa: "Tinggi" | "Sedang" | "Rendah" = "Sedang";
    let inisial = "S";
    if (nilaiNum >= 80) { kategoriSiswa = "Tinggi"; inisial = "T"; }
    else if (nilaiNum < 60) { kategoriSiswa = "Rendah"; inisial = "R"; }
    
    const jumlahSamaKategori = daftarSiswa.filter(s => s.kategori === kategoriSiswa).length;
    const kodeOtomatis = `${inisial}${jumlahSamaKategori + 1}`;
    
    const siswaRef = ref(db, "siswa");
    const siswaBaru = {
      nama: inputNama,
      nilaiTkm: nilaiNum,
      kategori: kategoriSiswa,
      kode: kodeOtomatis
    };

    await push(siswaRef, siswaBaru);
    setInputNama(""); setInputNilai(""); setActiveTab("daftar-siswa");
  };

  // Hapus Siswa dari Firebase
  const handleHapusSiswa = async (id: string) => {
    await remove(ref(db, `siswa/${id}`));
  };

  // Tambah Soal Manual ke Firebase
  const handleTambahSoalManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMateri || !inputPertanyaan || !inputKunci) return;
    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    
    const soalRef = ref(db, "soal");
    await push(soalRef, {
      kodeSoal: kodeOtomatis,
      materi: inputMateri,
      pertanyaan: inputPertanyaan,
      kunciJawaban: inputKunci,
      sumber: "Manual"
    });

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

  // Simpan Soal AI ke Firebase
  const simpanSoalDariAi = async () => {
    if (!hasilAi) return;
    const kodeOtomatis = `SL${String(bankSoal.length + 1).padStart(2, '0')}`;
    const soalRef = ref(db, "soal");
    
    await push(soalRef, {
      kodeSoal: kodeOtomatis,
      materi: promptTopik,
      pertanyaan: hasilAi.pertanyaan,
      kunciJawaban: hasilAi.jawaban,
      sumber: "AI"
    });

    setHasilAi(null); setActiveTab("daftar-soal");
  };

  // Acak Kelompok Heterogen & Simpan ke Firebase
  const handleAcakKelompokHeterogen = async () => {
    const targetCount = parseInt(jumlahKelompokTarget);
    if (isNaN(targetCount) || targetCount <= 0 || daftarSiswa.length === 0) return;

    const grupTinggi = [...daftarSiswa.filter(s => s.kategori === "Tinggi")].sort(() => Math.random() - 0.5);
    const grupSedang = [...daftarSiswa.filter(s => s.kategori === "Sedang")].sort(() => Math.random() - 0.5);
    const grupRendah = [...daftarSiswa.filter(s => s.kategori === "Rendah")].sort(() => Math.random() - 0.5);

    const kelompokBaru: Kelompok[] = Array.from({ length: targetCount }, (_, i) => ({
      namaKelompok: `Kelompok ${String.fromCharCode(65 + i)}`,
      anggota: [],
      soalDiberikan: []
    }));

    let currentKlp = 0;
    grupTinggi.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });
    grupSedang.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });
    grupRendah.forEach(s => { kelompokBaru[currentKlp].anggota.push(s); currentKlp = (currentKlp + 1) % targetCount; });

    await set(ref(db, "kelompok"), kelompokBaru);
    setActiveTab("daftar-kelompok");
  };

  // Acak Pembagian Soal ke Kelompok & Update Firebase
  const handleAcakPembagianSoal = async () => {
    if (hasilKelompok.length === 0 || bankSoal.length === 0) return;

    const updatedKelompok = hasilKelompok.map(klp => {
      const soalAcak = bankSoal[Math.floor(Math.random() * bankSoal.length)];
      return {
        ...klp,
        soalDiberikan: [soalAcak]
      };
    });

    await set(ref(db, "kelompok"), updatedKelompok);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 bg-white p-6 xl:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex items-center space-x-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">Collapose</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuSidebar.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeTab === item.id ? "bg-violet-50 text-violet-700 shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="mt-auto flex w-full items-center justify-center gap-2 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100">
            🚪 Keluar
          </button>
        </aside>

        <main className="flex-1 p-6 xl:p-10">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{menuSidebar.find((m) => m.id === activeTab)?.label}</p>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Selamat datang, Pak Rico 👋</h1>
              <p className="mt-2 text-sm text-slate-500">Kelola siswa, kelompok, dan bank soal secara realtime dengan antarmuka yang lebih bersih.</p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Siswa</p>
                <p className="mt-3 text-2xl font-black text-slate-900">{daftarSiswa.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Kelompok</p>
                <p className="mt-3 text-2xl font-black text-violet-700">{hasilKelompok.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Soal</p>
                <p className="mt-3 text-2xl font-black text-slate-900">{bankSoal.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/30">
            {activeTab === "ringkasan" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-md shadow-purple-100">
                  <h2 className="text-2xl font-bold">Halo, Pak Rico! 👋</h2>
                  <p className="text-purple-100 text-sm mt-1">Seluruh data saat ini tersambung ke Firebase Database secara aman dan permanen.</p>
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
                  <div className="border p-6 rounded-2xl bg-slate-50/50">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-slate-500 text-xs font-bold uppercase mt-2">Bank Soal</h3>
                    <p className="text-2xl font-black text-slate-900 mt-1">{bankSoal.length}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "input-siswa" && (
              <form onSubmit={handleTambahSiswa} className="mx-auto max-w-2xl space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Nama Siswa</label>
                    <input type="text" required value={inputNama} onChange={(e) => setInputNama(e.target.value)} placeholder="Nama lengkap" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Nilai TKM</label>
                    <input type="number" required value={inputNilai} onChange={(e) => setInputNilai(e.target.value)} placeholder="0 - 100" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:brightness-110">💾 Simpan Siswa Ke Cloud</button>
              </form>
            )}

            {activeTab === "daftar-siswa" && (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <table className="min-w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.22em] text-slate-500">
                      <th className="py-4 px-3">No</th>
                      <th className="py-4 px-3">Nama Siswa</th>
                      <th className="py-4 px-3">Nilai</th>
                      <th className="py-4 px-3">Kategori</th>
                      <th className="py-4 px-3">Kode</th>
                      <th className="py-4 px-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {daftarSiswa.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-sm text-slate-400">Belum ada data siswa di cloud database.</td>
                      </tr>
                    ) : (
                      daftarSiswa.map((s, idx) => (
                        <tr key={s.id} className="bg-white">
                          <td className="py-4 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-4 px-3 font-semibold text-slate-900">{s.nama}</td>
                          <td className="py-4 px-3 font-mono text-slate-800">{s.nilaiTkm}</td>
                          <td className="py-4 px-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${s.kategori === "Tinggi" ? "bg-emerald-50 text-emerald-700" : s.kategori === "Sedang" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                              {s.kategori}
                            </span>
                          </td>
                          <td className="py-4 px-3 font-mono text-slate-700">{s.kode}</td>
                          <td className="py-4 px-3">
                            <button onClick={() => handleHapusSiswa(s.id)} className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">❌ Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "input-soal" && (
              <form onSubmit={handleTambahSoalManual} className="mx-auto max-w-3xl space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Materi / Topik</label>
                    <input type="text" required value={inputMateri} onChange={(e) => setInputMateri(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Pertanyaan</label>
                    <textarea required value={inputPertanyaan} onChange={(e) => setInputPertanyaan(e.target.value)} rows={4} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Kunci Jawaban</label>
                    <input type="text" required value={inputKunci} onChange={(e) => setInputKunci(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  </div>
                </div>
                <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:brightness-110">💾 Daftarkan Soal ke Cloud</button>
              </form>
            )}

            {activeTab === "daftar-soal" && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <table className="min-w-full text-left text-sm text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.22em] text-slate-500">
                        <th className="py-4 px-3">Kode</th>
                        <th className="py-4 px-3">Materi</th>
                        <th className="py-4 px-3">Soal</th>
                        <th className="py-4 px-3">Kunci</th>
                        <th className="py-4 px-3">Sumber</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bankSoal.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-sm text-slate-400">Belum ada koleksi soal di cloud database.</td>
                        </tr>
                      ) : (
                        bankSoal.map((soal) => (
                          <tr key={soal.id} className="bg-white">
                            <td className="py-4 px-3 font-mono text-slate-900">{soal.kodeSoal}</td>
                            <td className="py-4 px-3 font-semibold text-slate-900">{soal.materi}</td>
                            <td className="py-4 px-3 text-slate-700">{soal.pertanyaan}</td>
                            <td className="py-4 px-3 font-mono text-slate-800">{soal.kunciJawaban}</td>
                            <td className="py-4 px-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">{soal.sumber}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "generate-ai" && (
              <div className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Topik Soal AI</label>
                  <input type="text" value={promptTopik} onChange={(e) => setPromptTopik(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                </div>
                <button onClick={handleGenerateSoalAI} className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:brightness-110">⚡ Generate Draf Soal</button>
                {hasilAi && (
                  <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
                    <p className="text-sm text-slate-700">{hasilAi.pertanyaan}</p>
                    <button onClick={simpanSoalDariAi} className="mt-4 rounded-3xl bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-slate-100">📥 Simpan ke Cloud Bank Soal</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "acak-siswa" && (
              <div className="space-y-5 max-w-md">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Pembagi Kelompok Heterogen Otomatis</h2>
                  <p className="text-sm text-slate-500 mt-2">Acak siswa berdasarkan kategori kinerja untuk membuat kelompok heterogen.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Jumlah Kelompok</label>
                  <input type="number" min="1" max="10" value={jumlahKelompokTarget} onChange={(e) => setJumlahKelompokTarget(e.target.value)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                </div>
                <button onClick={handleAcakKelompokHeterogen} className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:brightness-110">🔀 Jalankan & Publish Kelompok</button>
              </div>
            )}

            {activeTab === "acak-soal" && (
              <div className="space-y-5 max-w-md">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Distribusi Acak Soal</h2>
                  <p className="text-sm text-slate-500 mt-2">Bagikan soal acak ke setiap kelompok secara otomatis.</p>
                </div>
                {hasilKelompok.length === 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">⚠️ Jalankan menu "Acak Kelompok Siswa" terlebih dahulu.</div>
                ) : (
                  <button onClick={handleAcakPembagianSoal} className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:brightness-110">🎯 Acak dan Kirim Soal ke E-LKPD</button>
                )}
              </div>
            )}

            {activeTab === "daftar-kelompok" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daftar Kelompok Aktif</h2>
                  <p className="text-sm text-slate-500 mt-2">Lihat anggota dan soal yang saat ini ditugaskan.</p>
                </div>
                {hasilKelompok.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">Belum ada kelompok aktif di database cloud.</div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {Object.keys(hasilKelompok).map((key: any, idx) => {
                      const klp = hasilKelompok[key];
                      return (
                        <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">{klp.namaKelompok}</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Anggota Tim</p>
                              <ul className="mt-3 space-y-2">
                                {klp.anggota?.map((member: any) => (
                                  <li key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800">
                                    <span>{member.nama}</span>
                                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">{member.kode}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-3xl bg-white p-4 shadow-sm">
                              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Tugas Soal</p>
                              {!klp.soalDiberikan ? (
                                <p className="mt-3 text-sm text-slate-500 italic">Belum ada soal ditugaskan.</p>
                              ) : (
                                klp.soalDiberikan.map((soal: any) => (
                                  <div key={soal.id} className="mt-3 space-y-1">
                                    <p className="font-semibold text-slate-900">[{soal.kodeSoal}] {soal.materi}</p>
                                    <p className="text-sm text-slate-600">{soal.pertanyaan}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}