"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const logoInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", phone: "" });

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());

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

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("");
      return;
    }
    const next = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(next);
    return () => {
      URL.revokeObjectURL(next);
    };
  }, [logoFile]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const next = { name: "", email: "", phone: "" };
    if (!String(name || "").trim()) next.name = "Please enter a company name.";
    if (!String(email || "").trim()) next.email = "Please enter a company email.";
    else if (!isValidEmail(email)) next.email = "Please enter a valid email address.";
    if (!String(phone || "").trim()) next.phone = "Please enter a phone number.";
    setFieldErrors(next);

    const hasErrors = Object.values(next).some(Boolean);
    if (hasErrors) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (String(address || "").trim()) formData.append("address", address);
      if (logoFile) formData.append("logo", logoFile);

      const data = await apiFetch("/companies", {
        method: "POST",
        body: formData,
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
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-slate-700">Company Logo (Optional)</label>
              <div className="flex items-center gap-4">
                {logoPreviewUrl ? (
                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoPreviewUrl} alt="Company logo" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50" aria-hidden="true" />
                )}

                <div className="flex items-center gap-3">
                  <input
                    ref={logoInputRef}
                    className="hidden"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      setLogoFile(file);
                    }}
                  />

                  <button
                    type="button"
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold tracking-wide"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    UPLOAD IMAGE
                  </button>

                  <button
                    type="button"
                    disabled={!logoFile}
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-semibold tracking-wide disabled:opacity-60"
                    onClick={() => {
                      setLogoFile(null);
                      if (logoInputRef.current) logoInputRef.current.value = "";
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500">*.png, *.jpg, *.jpeg files up to 10MB</div>
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Company name</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="Company name"
              />
              {fieldErrors.name ? <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div> : null}
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Company email</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="company@email.com"
              />
              {fieldErrors.email ? <div className="text-xs text-red-600 mt-1">{fieldErrors.email}</div> : null}
            </div>

            <div className="flex flex-col gap-0">
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="auth-input h-11 mt-0 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="Phone"
              />
              {fieldErrors.phone ? <div className="text-xs text-red-600 mt-1">{fieldErrors.phone}</div> : null}
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
