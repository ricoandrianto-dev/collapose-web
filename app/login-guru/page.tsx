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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-violet-100 to-sky-100 px-4 py-10 font-sans text-slate-900">
      <div className="pointer-events-none absolute top-0 left-0 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-10 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-slate-200 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-600 px-6 py-5 text-white shadow-lg shadow-purple-200/40">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-2xl">👨‍🏫</div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-purple-100">Portal Guru</p>
                <h1 className="mt-2 text-3xl font-extrabold">Masuk ke Dashboard</h1>
              </div>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">Kelola kelas, kelompok, dan bank soal dari satu tempat dengan tampilan modern dan mudah dinavigasi.</p>
          <div className="rounded-3xl bg-slate-50 p-5 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Akun tes</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">username: guru</p>
            <p className="text-sm font-semibold text-slate-900">password: guru123</p>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-[2rem] bg-slate-950/95 p-8 text-white shadow-2xl shadow-slate-950/20">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Login Guru</h2>
            <p className="mt-2 text-sm text-slate-300">Masuk untuk mulai mengelola kelas dan kelompok.</p>
          </div>
          {error && (
            <div className="mb-4 rounded-3xl bg-red-500/15 px-4 py-3 text-sm text-red-100">⚠️ {error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="guru"
                className="w-full rounded-3xl border border-slate-800/80 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-3xl border border-slate-800/80 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-70"
            >
              {isLoading ? "Memproses Masuk..." : "Masuk ke Dashboard 🚀"}
            </button>
          </form>
          <div className="mt-5 text-center text-xs text-slate-400">
            <Link href="/" className="font-semibold text-white/80 hover:text-white">⬅️ Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}