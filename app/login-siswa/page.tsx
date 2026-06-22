"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, onValue } from "firebase/database";

export default function LoginSiswaPage() {
  const router = useRouter();
  const [namaSiswa, setNamaSiswa] = useState("");
  const [errorPesan, setErrorPesan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSiswa.trim()) return;

    setIsLoading(true);
    setErrorPesan("");

    try {
      const siswaRef = ref(db, "siswa");
      const snapshot = await get(siswaRef);
      
      if (snapshot.exists()) {
        const dataSiswa = snapshot.val();
        // Cari siswa berdasarkan nama (ignore case / tidak sensitif huruf besar kecil)
        const ditemukan = Object.keys(dataSiswa).find(
          (key) => dataSiswa[key].nama.toLowerCase().trim() === namaSiswa.toLowerCase().trim()
        );

        if (ditemukan) {
          // Jika ketemu, simpan nama dan ID siswa di localStorage browser sementara
          localStorage.setItem("siswa_id", ditemukan);
          localStorage.setItem("siswa_nama", dataSiswa[ditemukan].nama);
          
          // Tendang siswa ke halaman dashboard siswa
          router.push("/dashboard-siswa");
        } else {
          setErrorPesan("❌ Nama tidak ditemukan. Pastikan nama sesuai dengan yang didaftarkan Pak Rico!");
        }
      } else {
        setErrorPesan("❌ Belum ada data siswa yang didaftarkan di kelas ini.");
      }
    } catch (error) {
      setErrorPesan("⚠️ Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-900 via-slate-900 to-purple-900 flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
            C
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Collapose E-LKPD</h1>
          <p className="text-xs text-slate-300 font-medium">Ruang Kolaborasi Masalah Matematika Siswa</p>
        </div>

        {errorPesan && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-xl font-medium text-center animate-shake">
            {errorPesan}
          </div>
        )}

        <form onSubmit={handleLoginSiswa} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">MASUKKAN NAMA LENGKAPMU</label>
            <input
              type="text"
              required
              value={namaSiswa}
              onChange={(e) => setNamaSiswa(e.target.value)}
              placeholder="Contoh: Elvina Ratna Puspita"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? "⏳ Memeriksa Daftar Hadir..." : "🚀 Masuk Ke Ruang Diskusi"}
          </button>
        </form>

        <div className="text-center">
          <button onClick={() => router.push("/login-guru")} className="text-xs text-slate-400 hover:text-amber-300 transition-all font-medium">
            🔒 Masuk sebagai Guru
          </button>
        </div>

      </div>
    </div>
  );
}