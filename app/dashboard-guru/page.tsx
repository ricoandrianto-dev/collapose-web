"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
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
            <p className="text-xs text-slate-500 mt-1">Sistem Manajemen Kelompok Diskusi Realtime (Firebase Cloud)</p>
          </div>
        </header>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[500px]">
          
          {/* TAB: RINGKASAN */}
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
              <button type="submit" className="px-5 py-3 bg-purple-600 text-white font-semibold text-sm rounded-xl">💾 Simpan Siswa Ke Cloud</button>
            </form>
          )}

          {/* TAB: TABEL SISWA */}
          {activeTab === "daftar-siswa" && (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b">
                  <tr><th className="p-4">NO</th><th className="p-4">NAMA SISWA</th><th className="p-4">NILAI</th><th className="p-4">KATEGORI</th><th className="p-4">KODE</th><th className="p-4 text-center">AKSI</th></tr>
                </thead>
                <tbody className="divide-y">
                  {daftarSiswa.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="p-4 text-slate-400">{idx+1}</td><td className="p-4 font-bold">{s.nama}</td><td className="p-4 font-mono">{s.nilaiTkm}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.kategori === 'Tinggi' ? 'bg-emerald-50 text-emerald-700' : s.kategori === 'Sedang' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{s.kategori}</span></td>
                      <td className="p-4 font-mono font-bold text-purple-700">{s.kode}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleHapusSiswa(s.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-lg">❌ Hapus</button>
                      </td>
                    </tr>
                  ))}
                  {daftarSiswa.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-xs">Belum ada data siswa di cloud database.</td></tr>
                  )}
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
              <button type="submit" className="px-5 py-3 bg-purple-600 text-white font-semibold text-sm rounded-xl">💾 Daftarkan Soal ke Cloud</button>
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
                      <td className="p-4"><span className="text-[10px] font-bold bg-slate-100 p-1 rounded">{soal.sumber}</span></td>
                    </tr>
                  ))}
                  {bankSoal.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs">Belum ada koleksi soal di cloud database.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: GENERATOR SOAL AI */}
          {activeTab === "generate-ai" && (
            <div className="space-y-4 max-w-xl">
              <input type="text" value={promptTopik} onChange={(e) => setPromptTopik(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm" />
              <button onClick={handleGenerateSoalAI} className="w-full py-3 bg-purple-600 text-white font-semibold text-sm rounded-xl">⚡ Generate Draf Soal</button>
              {hasilAi && (
                <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2">
                  <p className="text-sm">{hasilAi.pertanyaan}</p>
                  <button onClick={simpanSoalDariAi} className="text-xs bg-white text-purple-700 border p-2 rounded-lg font-bold">📥 Simpan ke Cloud Bank Soal</button>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACAK SISWA KELOMPOK */}
          {activeTab === "acak-siswa" && (
            <div className="max-w-md space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pembagi Kelompok Heterogen Otomatis</h2>
                <p className="text-xs text-slate-500 mt-1">Sistem akan mengacak siswa secara silang beradasarkan peringkat kemampuannya.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">TENTUKAN JUMLAH KELOMPOK</label>
                <input type="number" min="1" max="10" value={jumlahKelompokTarget} onChange={(e) => setJumlahKelompokTarget(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm font-bold" />
              </div>
              <button onClick={handleAcakKelompokHeterogen} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl">
                🔀 Jalankan & Publish Kelompok ke Cloud
              </button>
            </div>
          )}

          {/* TAB: ACAK SOAL */}
          {activeTab === "acak-soal" && (
            <div className="max-w-md space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Distribusi Acak Pembagian Soal</h2>
              </div>
              {hasilKelompok.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-xs">⚠️ Silakan jalankan menu "Acak Kelompok Siswa" terlebih dahulu.</div>
              ) : (
                <button onClick={handleAcakPembagianSoal} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl">
                  🎯 Acak dan Kirim Soal ke E-LKPD Kelompok Realtime
                </button>
              )}
            </div>
          )}

          {/* TAB: DAFTAR KELOMPOK */}
          {activeTab === "daftar-kelompok" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tampilan Panel Kelompok & E-LKPD Aktif</h2>
              </div>
              {hasilKelompok.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">Belum ada kelompok aktif di database cloud.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(hasilKelompok).map((key: any, idx) => {
                    const klp = hasilKelompok[key];
                    return (
                      <div key={idx} className="border rounded-2xl p-6 bg-slate-50/40 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                          <h3 className="font-extrabold text-purple-800 text-base">{klp.namaKelompok}</h3>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase">Anggota Tim:</h4>
                          <ul className="space-y-1.5">
                            {klp.anggota?.map((member: any) => (
                              <li key={member.id} className="flex justify-between items-center bg-white p-2 rounded-xl border text-xs">
                                <span className="font-semibold text-slate-800">{member.nama}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-50 text-purple-700">{member.kode}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-dashed">
                          <h4 className="text-[10px] font-bold text-purple-600 uppercase">Tugas Soal Kelompok:</h4>
                          {!klp.soalDiberikan ? (
                            <p className="text-[11px] text-slate-400 italic">Belum ada soal ditugaskan.</p>
                          ) : (
                            klp.soalDiberikan.map((soal: any) => (
                              <div key={soal.id} className="space-y-1">
                                <p className="text-[11px] font-bold text-slate-900">[{soal.kodeSoal}] {soal.materi}</p>
                                <p className="text-[11px] text-slate-600">{soal.pertanyaan}</p>
                              </div>
                            ))
                          )}
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
  );
}