"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import TextInput from "@/components/TextInput";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (data?.token) {
        window.localStorage.setItem("tms_token", data.token);
      }
      if (data?.user) {
        window.localStorage.setItem("tms_user", JSON.stringify(data.user));
      }

      const role = String(data?.user?.role || "admin");
      const hasCompany = Boolean(data?.user?.company);
      if (role === "driver") {
        router.push("/unauthorized");
      } else if (!hasCompany) {
        router.push("/create-company");
      } else {
        router.push("/dashboard/orders");
      }
    } catch (e) {
      setError(e?.message || "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
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
            {error ? (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            ) : null}

            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[var(--primary-blue)] text-white font-semibold"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-sm text-slate-600 text-center">
              {"Don't have an account? "}
              <Link href="/register" className="text-[var(--primary-blue)] font-medium">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
