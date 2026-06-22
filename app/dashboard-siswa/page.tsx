"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue, set, push } from "firebase/database";

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

interface JawabanKelompok {
  teksJawaban: string;
  dikirimOleh: string;
  waktuKirim: string;
}

export default function DashboardSiswaPage() {
  const router = useRouter();
  const [namaSiswaLocal, setNamaSiswaLocal] = useState("");
  const [siswaIdLocal, setSiswaIdLocal] = useState("");
  
  // State sinkronisasi Firebase
  const [kelompokSaya, setKelompokSaya] = useState<Kelompok | null>(null);
  const [indexKelompokSaya, setIndexKelompokSaya] = useState<number | null>(null);
  const [statusMencari, setStatusMencari] = useState(true);

  // State Form Jawaban
  const [inputJawaban, setInputJawaban] = useState("");
  const [jawabanTerpajang, setJawabanTerpajang] = useState<JawabanKelompok | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Cek Autentikasi dan Identitas Siswa di LocalStorage
  useEffect(() => {
    const storedNama = localStorage.getItem("siswa_nama");
    const storedId = localStorage.getItem("siswa_id");

    if (!storedNama || !storedId) {
      router.push("/login-siswa");
    } else {
      setNamaSiswaLocal(storedNama);
      setSiswaIdLocal(storedId);
    }
  }, [router]);

  // 2. Sinkronisasi Data Kelompok & Deteksi Otomatis Tim Siswa dari Firebase
  useEffect(() => {
    if (!namaSiswaLocal) return;

    const kelompokRef = ref(db, "kelompok");
    const unsubscribe = onValue(kelompokRef, (snapshot) => {
      const data = snapshot.val();
      setStatusMencari(true);

      if (data && Array.isArray(data)) {
        // Cari kelompok yang di dalam list anggotanya terdapat nama siswa ini
        let ketemu = false;
        data.forEach((klp: Kelompok, idx: number) => {
          if (klp && klp.anggota) {
            const memberMatch = klp.anggota.find(
              (m) => m.nama.toLowerCase().trim() === namaSiswaLocal.toLowerCase().trim()
            );
            if (memberMatch) {
              setKelompokSaya(klp);
              setIndexKelompokSaya(idx);
              ketemu = true;
            }
          }
        });

        if (!ketemu) {
          setKelompokSaya(null);
          setIndexKelompokSaya(null);
        }
      } else {
        setKelompokSaya(null);
        setIndexKelompokSaya(null);
      }
      setStatusMencari(false);
    });

    return () => unsubscribe();
  }, [namaSiswaLocal]);

  // 3. Sinkronisasi Jawaban Kelompok secara Realtime
  useEffect(() => {
    if (indexKelompokSaya === null) {
      setJawabanTerpajang(null);
      return;
    }

    const jawabanRef = ref(db, `jawaban_kelompok/kelompok_${indexKelompokSaya}`);
    const unsubscribeJawaban = onValue(jawabanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setJawabanTerpajang(data);
        // Biar text area sinkron dengan input terakhir dari teman sekelompok
        if (!inputJawaban) {
          setInputJawaban(data.teksJawaban);
        }
      } else {
        setJawabanTerpajang(null);
      }
    });

    return () => unsubscribeJawaban();
  }, [indexKelompokSaya]);

  // 4. Kirim Jawaban Hasil Diskusi Kelompok ke Firebase
  const handleKirimJawaban = async (e: React.FormEvent) => {
    e.preventDefault();
    if (indexKelompokSaya === null || !inputJawaban.trim()) return;

    setIsSaving(true);
    try {
      const jawabanRef = ref(db, `jawaban_kelompok/kelompok_${indexKelompokSaya}`);
      const payload: JawabanKelompok = {
        teksJawaban: inputJawaban,
        dikirimOleh: namaSiswaLocal,
        waktuKirim: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB"
      };
      await set(jawabanRef, payload);
    } catch (error) {
      alert("Gagal mengirim jawaban, periksa koneksi internet.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutSiswa = () => {
    localStorage.removeItem("siswa_nama");
    localStorage.removeItem("siswa_id");
    router.push("/login-siswa");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* NAVBAR ATAS */}
      <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-base">C</div>
          <span className="text-lg font-bold text-slate-900">Collapose Siswa</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{namaSiswaLocal}</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-end">● Online Aktif</p>
          </div>
          <button onClick={handleLogoutSiswa} className="px-3 py-1.5 border border-slate-200 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all">
            🚪 Keluar
          </button>
        </div>
      </header>

      {/* BODY KONTEN */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto space-y-6">
        
        {statusMencari ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Memindai pembagian kelompok realtime Pak Rico...</p>
          </div>
        ) : !kelompokSaya ? (
          /* JIKA BELUM MASUK KELOMPOK MANAPUN */
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-16 space-y-4">
            <span className="text-5xl block animate-bounce">🎲</span>
            <h2 className="text-xl font-extrabold text-slate-900">Halo, {namaSiswaLocal}!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Kamu berhasil masuk sistem. Saat ini Pak Rico belum menekan tombol <b>"Acak Kelompok Siswa"</b> atau namamu belum dimasukkan ke dalam tim diskusi kelompok.
            </p>
            <div className="inline-block px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 animate-pulse">
              ⏳ Mohon tunggu instruksi Pak Rico di kelas ya...
            </div>
          </div>
        ) : (
          /* JIKA SUDAH BERHASIL MASUK KELOMPOK HETEROGEN */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PANEL KIRI: INFO KELOMPOK DAN REKAN TIM */}
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-white/5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">TIM DISKUSI KAMU</p>
                  <h2 className="text-2xl font-black mt-0.5 text-white">{kelompokSaya.namaKelompok}</h2>
                </div>
                
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rekan Tim (Heterogen):</h4>
                  <div className="space-y-2">
                    {kelompokSaya.anggota?.map((member) => (
                      <div key={member.id} className={`flex justify-between items-center bg-white/5 border p-2.5 rounded-xl text-xs ${member.nama === namaSiswaLocal ? 'border-amber-400/50 bg-amber-400/5' : 'border-white/5'}`}>
                        <span className={`font-semibold ${member.nama === namaSiswaLocal ? 'text-amber-300' : 'text-slate-200'}`}>
                          {member.nama} {member.nama === namaSiswaLocal && "(Kamu)"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                          {member.kode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL KANAN: SOAL E-LKPD DAN RUANG INPUT JAWABAN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* KOTAK MASALAH / SOAL */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Masalah Matematika Kelompok</h3>
                </div>
                
                {!kelompokSaya.soalDiberikan || kelompokSaya.soalDiberikan.length === 0 ? (
                  <p className="text-xs text-amber-600 font-medium italic bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    ⏳ Kelompok sudah terbentuk, namun Pak Rico belum membagikan/mengacak soal tugas kelompok. Mohon tunggu...
                  </p>
                ) : (
                  kelompokSaya.soalDiberikan.map((soal) => (
                    <div key={soal.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">{soal.kodeSoal}</span>
                        <span className="text-xs font-bold text-slate-500">Materi: {soal.materi}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                        {soal.pertanyaan}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* KOTAK SUBMIT JAWABAN KOLABORATIF */}
              {kelompokSaya.soalDiberikan && kelompokSaya.soalDiberikan.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">✍️</span>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Lembar Jawaban E-LKPD</h3>
                    </div>
                    {jawabanTerpajang && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Terakhir diubah oleh <b>{jawabanTerpajang.dikirimOleh}</b> pukul {jawabanTerpajang.waktuKirim}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleKirimJawaban} className="space-y-3">
                    <textarea
                      required
                      rows={5}
                      value={inputJawaban}
                      onChange={(e) => setInputJawaban(e.target.value)}
                      placeholder="Ketikkan hasil diskusi, cara pengerjaan, dan jawaban akhir kelompok di sini secara detail..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all font-medium leading-relaxed"
                    />
                    
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-slate-400 leading-tight max-w-xs">
                        *Jawaban ini bersifat kolaboratif. Siapapun anggota tim yang menekan tombol simpan akan memperbarui jawaban kelompok secara otomatis.
                      </p>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
                      >
                        {isSaving ? "⏳ Menyimpan..." : "💾 Simpan Jawaban Kelompok"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}