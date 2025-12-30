"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import SelectInput from "@/components/SelectInput";

const OPTIONS = [
  { value: "en", label: "English" },
];

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [language, setLanguage] = useState("en");
  const [initialLanguage, setInitialLanguage] = useState("en");

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

    const seed = () => {
      try {
        const raw = window.localStorage.getItem("tms_user");
        if (!raw) return;
        const u = JSON.parse(raw);
        const lang = String(u?.language || "en");
        const safe = lang === "en" ? "en" : "en";
        setLanguage(safe);
        setInitialLanguage(safe);
      } catch {
        // ignore
      }
    };

    seed();

    apiFetch("/users/me")
      .then((u) => {
        if (cancelled) return;
        const lang = String(u?.language || "en");
        const safe = lang === "en" ? "en" : "en";
        setLanguage(safe);
        setInitialLanguage(safe);
        try {
          window.localStorage.setItem("tms_user", JSON.stringify(u));
        } catch {
          // ignore
        }
      })
      .catch(() => null)
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = useMemo(() => {
    return String(language || "en") !== String(initialLanguage || "en");
  }, [language, initialLanguage]);

  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  const canSave = useMemo(() => {
    return Boolean(language) && isDirty;
  }, [language, isDirty]);

  const onCancel = () => {
    setError("");
    setJustSaved(false);
    setLanguage(initialLanguage || "en");
  };

  const onSave = async () => {
    setError("");
    setJustSaved(false);
    setSaving(true);
    try {
      const updated = await apiFetch("/users/me", {
        method: "PUT",
        body: { language },
      });
      try {
        window.localStorage.setItem("tms_user", JSON.stringify(updated));
        window.dispatchEvent(new Event("tms_user_updated"));
      } catch {
        // ignore
      }
      setInitialLanguage(String(updated?.language || "en") === "en" ? "en" : "en");
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
        <div className="settings-page-title">Language</div>
        <div className="settings-page-subtitle">Choose your preferred language.</div>

        {loading ? (
          <div style={{ color: "#4b5563" }}>Loading…</div>
        ) : (
          <>
            <SelectInput
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled
              wrapperClassName="settings-field settings-field-span"
            >
              {OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>

            {error ? <div className="settings-error">{error}</div> : null}

            <div className="settings-actions">
              <button className="btn-ghost" onClick={onCancel} disabled={!isDirty || saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={onSave} disabled={!canSave || saving}>
                {saving ? "Saving…" : justSaved ? "Saved" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
