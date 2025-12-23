"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    // TODO: wire up real auth; for now, proceed into the dashboard.
    router.push("/dashboard/orders");
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0">
            <div className="text-xl font-bold text-slate-900">TMS Dashboard</div>
            <div className="text-sm text-slate-500">Sign in to continue</div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[var(--primary-blue)] text-white font-semibold"
            >
              Sign in
            </button>

            <div className="text-sm text-slate-600 text-center">
              {"Don't have an account? "}
              <Link href="/register" className="text-[var(--primary-blue)] font-medium">
                Register
              </Link>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Demo UI only — authentication not wired yet.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
