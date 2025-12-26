"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const avatarInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initials = useMemo(() => {
    const f = String(firstName || "").trim();
    const l = String(lastName || "").trim();
    const a = f ? f[0].toUpperCase() : "";
    const b = l ? l[0].toUpperCase() : "";
    return `${a}${b}` || "?";
  }, [firstName, lastName]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl("");
      return;
    }
    const next = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(next);
    return () => {
      URL.revokeObjectURL(next);
    };
  }, [avatarFile]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      if (avatarFile) formData.append("avatar", avatarFile);

      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: formData,
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
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-slate-700">Profile Picture (Optional)</label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 font-semibold">
                  {avatarPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreviewUrl} alt="Profile picture" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={avatarInputRef}
                    className="hidden"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      setAvatarFile(file);
                    }}
                  />

                  <button
                    type="button"
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold tracking-wide"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    UPLOAD IMAGE
                  </button>

                  <button
                    type="button"
                    disabled={!avatarFile}
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-semibold tracking-wide disabled:opacity-60"
                    onClick={() => {
                      setAvatarFile(null);
                      if (avatarInputRef.current) avatarInputRef.current.value = "";
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500">*.png, *.jpg, *.jpeg files up to 10MB</div>
            </div>

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
