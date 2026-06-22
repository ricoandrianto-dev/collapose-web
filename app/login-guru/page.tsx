"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginGuruPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (username === "guru" && password === "guru123") {
        router.push("/dashboard-guru");
      } else {
        setError("Username atau password salah! (Gunakan guru / guru123)");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f3f0ff] via-[#f8fafc] to-[#e0e7ff] text-slate-800 antialiased font-sans flex flex-col justify-center items-center relative overflow-hidden px-4">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-700 transition-colors">
            ⬅️ Kembali ke Beranda
          </button>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-white shadow-2xl shadow-purple-100/50 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200 mx-auto mb-3">
            👨‍🏫
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Guru</h1>
          <p className="text-xs text-slate-500">Masuk untuk mengelola kelas, kelompok, dan LKPD siswa.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wide block">USERNAME</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 text-sm">👤</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 tracking-wide block">PASSWORD</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔒</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm tracking-wide rounded-xl shadow-md shadow-purple-200 transition-all duration-200 transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Memproses Masuk..." : "Masuk ke Dashboard 🚀"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            Kredensial Pengujian: <br />
            <span className="font-mono text-purple-600">username: guru</span> | <span className="font-mono text-purple-600">password: guru123</span>
          </p>
        </div>
      </div>
    </div>
  );
}