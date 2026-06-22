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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-900 text-white font-sans flex items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute left-[-8%] top-[-2%] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-3xl font-black text-white shadow-lg shadow-orange-500/30">
            C
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Collapose E-LKPD</h1>
          <p className="mt-2 text-sm text-slate-200/90">Ruang kolaboratif matematika untuk siswa kelas.</p>
        </div>

        {errorPesan && (
          <div className="mb-5 rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorPesan}
          </div>
        )}

        <form onSubmit={handleLoginSiswa} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.3em] text-slate-300">Nama Lengkap</label>
            <input
              type="text"
              required
              value={namaSiswa}
              onChange={(e) => setNamaSiswa(e.target.value)}
              placeholder="Contoh: Elvina Ratna Puspita"
              className="w-full rounded-3xl border border-white/15 bg-slate-950/20 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:opacity-70"
          >
            {isLoading ? "⏳ Memeriksa Daftar Hadir..." : "🚀 Masuk Ke Ruang Diskusi"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-300">
          <button onClick={() => router.push("/login-guru")} className="font-semibold text-white/80 hover:text-white">
            🔒 Masuk sebagai Guru
          </button>
        </div>
      </div>
    </div>
  );
}