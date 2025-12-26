"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tms_user");
      if (!raw) return;
      const u = JSON.parse(raw);
      const role = String(u?.role || "admin");
      if (role === "driver") router.replace("/unauthorized");
      if (u?.company) router.replace("/dashboard/orders");
    } catch {
      // ignore
    }
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiFetch("/companies", {
        method: "POST",
        body: { name, companyId, email, phone, address },
      });

      if (data?.user) {
        window.localStorage.setItem("tms_user", JSON.stringify(data.user));
      } else {
        // fallback: refresh current user
        const me = await apiFetch("/users/me");
        window.localStorage.setItem("tms_user", JSON.stringify(me));
      }

      router.push("/dashboard/orders");
    } catch (err) {
      setError(err?.message || "Failed to create company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0">
            <div className="text-xl font-bold text-slate-900">Create company</div>
            <div className="text-sm text-slate-500">Set up your company to continue</div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Company name</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Company name"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Company ID</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Company ID"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Company email</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                required
              />
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address (optional)"
              />
            </div>

            {error ? (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-[var(--primary-blue)] text-white font-semibold disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create company"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
