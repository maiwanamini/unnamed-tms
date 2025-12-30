"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import AvatarCircle from "@/components/AvatarCircle";
import TextInput from "@/components/TextInput";
import PhoneInput from "@/components/PhoneInput";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const [me, setMe] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [initialProfile, setInitialProfile] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    };
  }, [avatarFile]);

  useEffect(() => {
    let cancelled = false;

    const seed = () => {
      try {
        const raw = window.localStorage.getItem("tms_user");
        if (!raw) return;
        const u = JSON.parse(raw);
        if (!u) return;
        const nextFirst = String(u?.firstName || "");
        const nextLast = String(u?.lastName || "");
        const nextEmail = String(u?.email || "");
        const nextPhone = String(u?.phone || "");
        setMe(u);
        setFirstName(nextFirst);
        setLastName(nextLast);
        setEmail(nextEmail);
        setPhone(nextPhone);
        setInitialProfile({ firstName: nextFirst, lastName: nextLast, email: nextEmail, phone: nextPhone });
      } catch {
        // ignore
      }
    };

    seed();

    apiFetch("/users/me")
      .then((u) => {
        if (cancelled) return;
        const nextFirst = String(u?.firstName || "");
        const nextLast = String(u?.lastName || "");
        const nextEmail = String(u?.email || "");
        const nextPhone = String(u?.phone || "");
        setMe(u);
        setFirstName(nextFirst);
        setLastName(nextLast);
        setEmail(nextEmail);
        setPhone(nextPhone);
        setInitialProfile({ firstName: nextFirst, lastName: nextLast, email: nextEmail, phone: nextPhone });
        try {
          window.localStorage.setItem("tms_user", JSON.stringify(u));
        } catch {
          // ignore
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Failed to load profile");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const canSave = useMemo(() => {
    if (!me?._id) return false;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return false;
    return true;
  }, [me, firstName, lastName, email]);

  const isDirty = useMemo(() => {
    if (!me?._id) return false;
    if (avatarFile) return true;
    return (
      firstName !== initialProfile.firstName ||
      lastName !== initialProfile.lastName ||
      email !== initialProfile.email ||
      phone !== initialProfile.phone
    );
  }, [me, avatarFile, firstName, lastName, email, phone, initialProfile]);

  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  const onCancel = () => {
    setError("");
    setJustSaved(false);
    setAvatarFile(null);
    setFirstName(initialProfile.firstName);
    setLastName(initialProfile.lastName);
    setEmail(initialProfile.email);
    setPhone(initialProfile.phone);
  };

  const onSave = async () => {
    setError("");
    setJustSaved(false);
    setSaving(true);
    try {
      const nextFirstName = firstName.trim();
      const nextLastName = lastName.trim();
      const nextEmail = email.trim();
      const nextPhone = phone.trim();

      const updated = await apiFetch("/users/me", {
        method: "PUT",
        body: avatarFile
          ? (() => {
              const fd = new FormData();
              fd.append("firstName", nextFirstName);
              fd.append("lastName", nextLastName);
              fd.append("email", nextEmail);
              fd.append("phone", nextPhone);
              fd.append("avatar", avatarFile);
              return fd;
            })()
          : {
              firstName: nextFirstName,
              lastName: nextLastName,
              email: nextEmail,
              phone: nextPhone,
            },
      });

      setMe(updated);
      try {
        window.localStorage.setItem("tms_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("tms_user_updated"));
      } catch {
        // ignore
      }
      setAvatarFile(null);
      setInitialProfile({
        firstName: String(updated?.firstName || ""),
        lastName: String(updated?.lastName || ""),
        email: String(updated?.email || ""),
        phone: String(updated?.phone || ""),
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

  return (
    <div className="settings-page">
      <div className="card settings-tab-card">
        <div className="settings-page-title">Profile</div>
        <div className="settings-page-subtitle">Manage your account and contact details.</div>

        {loading ? (
          <div style={{ color: "#4b5563" }}>Loading…</div>
        ) : (
          <>
            <div className="settings-profile-layout">
              <div className="settings-profile-photo">
                <div className="settings-label">Photo</div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) {
                      setAvatarFile(null);
                      return;
                    }
                    if (!String(f.type || "").startsWith("image/")) {
                      setError("Please choose an image file.");
                      setAvatarFile(null);
                      return;
                    }
                    setAvatarFile(f);
                  }}
                />

                <button
                  type="button"
                  className="settings-profile-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change profile photo"
                  disabled={saving}
                >
                  <AvatarCircle
                    size={140}
                    src={avatarPreviewUrl || String(me?.avatarUrl || "")}
                    name={String(`${firstName} ${lastName}`).trim()}
                    alt="Profile photo"
                    style={{ background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb" }}
                  />
                  <span className="settings-profile-photo-overlay" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M9 3a1 1 0 0 0-.8.4L6.75 5H4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-2.75l-1.45-1.6A1 1 0 0 0 14 3H9Zm3 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                      />
                    </svg>
                    <span className="settings-profile-photo-overlay-text">Update Photo</span>
                  </span>
                </button>
              </div>

              <div className="settings-profile-fields">
                <div className="settings-grid">
                  <TextInput
                    label="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    wrapperClassName="settings-field"
                  />

                  <TextInput
                    label="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    wrapperClassName="settings-field"
                  />

                  <TextInput
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    wrapperClassName="settings-field settings-field-span"
                  />

                  <div className="settings-field settings-field-span">
                    <label className="block text-sm font-medium text-slate-700">Phone</label>
                    <PhoneInput value={phone} placeholder="Phone" onChange={(v) => setPhone(v)} />
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
