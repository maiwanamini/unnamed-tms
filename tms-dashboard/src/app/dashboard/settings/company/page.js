"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import TextInput from "@/components/TextInput";
import PhoneInput from "@/components/PhoneInput";
import AddressAutocompleteInput from "@/components/AddressAutocompleteInput";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [initialCompany, setInitialCompany] = useState({ name: "", email: "", phone: "", address: "", logoUrl: "" });

  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const me = await apiFetch("/users/me");
        if (cancelled) return;

        const cid = String(me?.company?._id || "");
        if (!cid) {
          setError("No company found for this user.");
          setLoading(false);
          return;
        }

        setCompanyId(cid);

        const company = await apiFetch(`/companies/${cid}`);
        if (cancelled) return;

        setName(String(company?.name || ""));
        setEmail(String(company?.email || ""));
        setPhone(String(company?.phone || ""));
        setAddress(String(company?.address || ""));
        const nextLogo = String(company?.logoUrl || "");
        setLogoUrl(nextLogo);
        setInitialCompany({
          name: String(company?.name || ""),
          email: String(company?.email || ""),
          phone: String(company?.phone || ""),
          address: String(company?.address || ""),
          logoUrl: nextLogo,
        });
      } catch (e) {
        if (cancelled) return;
        setError(e?.data?.message || e?.message || "Failed to load company");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(() => {
    if (!companyId) return false;
    if (!name.trim() || !email.trim() || !phone.trim()) return false;
    return true;
  }, [companyId, name, email, phone]);

  const isDirty = useMemo(() => {
    if (!companyId) return false;
    if (logoFile) return true;
    return (
      name !== initialCompany.name ||
      email !== initialCompany.email ||
      phone !== initialCompany.phone ||
      address !== initialCompany.address
    );
  }, [companyId, logoFile, name, email, phone, address, initialCompany]);

  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  const onPickLogo = (file) => {
    if (!file) {
      setLogoFile(null);
      setLogoUrl(initialCompany.logoUrl);
      return;
    }
    if (!String(file.type || "").startsWith("image/")) {
      setError("Please choose an image file.");
      setLogoFile(null);
      return;
    }

    setLogoFile(file);
    const nextUrl = URL.createObjectURL(file);
    setLogoUrl(nextUrl);
  };

  const onSave = async () => {
    setError("");
    setJustSaved(false);
    setSaving(true);

    try {
      const hasFile = Boolean(logoFile);

      const body = hasFile ? new FormData() : {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (hasFile) {
        body.append("name", name.trim());
        body.append("email", email.trim());
        body.append("phone", phone.trim());
        body.append("address", address.trim());
        body.append("logo", logoFile);
      }

      const updatedCompany = await apiFetch(`/companies/${companyId}`, {
        method: "PUT",
        body,
      });

      // Refresh /users/me so the main sidebar (company name/logo) updates.
      const refreshedMe = await apiFetch("/users/me");
      try {
        window.localStorage.setItem("tms_user", JSON.stringify(refreshedMe));
        window.dispatchEvent(new Event("tms_user_updated"));
      } catch {
        // ignore
      }

      setName(String(updatedCompany?.name || ""));
      setEmail(String(updatedCompany?.email || ""));
      setPhone(String(updatedCompany?.phone || ""));
      setAddress(String(updatedCompany?.address || ""));
      const nextLogo = String(updatedCompany?.logoUrl || "");
      setLogoUrl(nextLogo);
      setLogoFile(null);

      setInitialCompany({
        name: String(updatedCompany?.name || ""),
        email: String(updatedCompany?.email || ""),
        phone: String(updatedCompany?.phone || ""),
        address: String(updatedCompany?.address || ""),
        logoUrl: nextLogo,
      });

      setJustSaved(true);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setJustSaved(false), 1500);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setError("");
    setJustSaved(false);
    setLogoFile(null);
    setName(initialCompany.name);
    setEmail(initialCompany.email);
    setPhone(initialCompany.phone);
    setAddress(initialCompany.address);
    setLogoUrl(initialCompany.logoUrl);
  };

  return (
    <div className="settings-page">
      <div className="card settings-tab-card">
        <div className="settings-page-title">Company</div>
        <div className="settings-page-subtitle">Manage your organization details.</div>

        {loading ? (
          <div style={{ color: "#4b5563" }}>Loading…</div>
        ) : (
          <>
            <div className="settings-profile-layout">
              <div className="settings-profile-photo">
                <div className="settings-label">Logo</div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => onPickLogo(e.target.files?.[0] || null)}
                />

                <button
                  type="button"
                  className="settings-company-logo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change company logo"
                  disabled={saving}
                >
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Company logo" className="settings-company-logo-img" />
                  ) : (
                    <div className="settings-company-logo-empty" />
                  )}

                  <span className="settings-profile-photo-overlay" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M9 3a1 1 0 0 0-.8.4L6.75 5H4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-2.75l-1.45-1.6A1 1 0 0 0 14 3H9Zm3 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                      />
                    </svg>
                    <span className="settings-profile-photo-overlay-text">Update Logo</span>
                  </span>
                </button>
              </div>

              <div className="settings-profile-fields">
                <div className="settings-grid">
                  <TextInput
                    label="Company name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    wrapperClassName="settings-field settings-field-span"
                  />

                  <TextInput
                    label="Company email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    wrapperClassName="settings-field settings-field-span"
                  />

                  <div className="settings-field settings-field-span">
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <PhoneInput value={phone} placeholder="Phone" onChange={(v) => setPhone(v)} />
                  </div>

                  <div className="settings-field settings-field-span">
                    <label className="block text-sm font-medium text-slate-700">Address</label>
                    <AddressAutocompleteInput
                      placeholder="Address"
                      value={address}
                      onChangeText={(next) => setAddress(next)}
                      onSelect={(it) => setAddress(String(it?.label || ""))}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error ? <div className="settings-error">{error}</div> : null}

            <div className="settings-actions">
              <button className="btn-ghost" onClick={onCancel} disabled={!isDirty || saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={onSave} disabled={!canSave || !isDirty || saving}>
                {saving ? "Saving…" : justSaved ? "Saved" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
