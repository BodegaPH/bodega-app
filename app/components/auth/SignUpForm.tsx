"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/auth/signin?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Create an account
        </h2>
        <p className="text-sm text-zinc-400">
          Get started with Bodega to manage your inventory
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-lg text-sm flex items-center">
          <span className="font-medium mr-2">Error:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-900 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-900 transition-all"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-900 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-zinc-950 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-6"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-zinc-950 text-zinc-500">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
