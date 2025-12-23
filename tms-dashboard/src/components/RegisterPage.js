"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toApiUrl } from "@/lib/fetcher";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(toApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        let message = `Registration failed (${res.status})`;
        try {
          const data = await res.json();
          message = data?.message || data?.error || message;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      router.push("/dashboard/orders");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0">
            <div className="text-xl font-bold text-slate-900">Create account</div>
            <div className="text-sm text-slate-500">Register to continue</div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">First name</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Last name</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
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
              <div className="relative">
                <input
                  className="auth-input auth-input--with-icon h-11 mt-0 w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="auth-password-toggle absolute top-1/2 right-2 -translate-y-1/2 text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  className="auth-input auth-input--with-icon h-11 mt-0 w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="auth-password-toggle absolute top-1/2 right-2 -translate-y-1/2 text-slate-500"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-[var(--primary-blue)] text-white font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Continue"}
            </button>

            <div className="text-xs text-slate-500 text-center">
              {"By clicking Continue, you agree to the "}
              <Link href="/privacy" className="text-[var(--primary-blue)] font-medium">
                Privacy Policy
              </Link>
              {" and "}
              <Link href="/policy" className="text-[var(--primary-blue)] font-medium">
                Policy
              </Link>
              {"."}
            </div>

            <div className="text-sm text-slate-600 text-center">
              Already have an account?{" "}
              <Link href="/" className="text-[var(--primary-blue)] font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
