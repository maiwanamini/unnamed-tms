"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import PasswordInput from "@/components/PasswordInput";

export default function Page() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const isDirty = useMemo(() => {
    return Boolean(currentPassword || newPassword || confirmPassword);
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    if (isDirty) setJustSaved(false);
  }, [isDirty]);

  const canSave = useMemo(() => {
    if (!currentPassword || !newPassword || !confirmPassword) return false;
    if (newPassword.length < 8) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  }, [currentPassword, newPassword, confirmPassword]);

  const onSave = async () => {
    setError("");
    setJustSaved(false);
    setSaving(true);
    try {
      await apiFetch("/users/me/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setJustSaved(true);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setJustSaved(false), 1500);
    } catch (e) {
      setError(e?.data?.message || e?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setError("");
    setJustSaved(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="settings-page">
      <div className="card settings-tab-card">
        <div className="settings-page-title">Password</div>
        <div className="settings-page-subtitle">Update your password.</div>

        <div className="settings-grid">
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            wrapperClassName="settings-field settings-field-span"
            ariaLabelHide="Hide current password"
            ariaLabelShow="Show current password"
          />

          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            wrapperClassName="settings-field settings-field-span"
            helpText="Must be at least 8 characters."
            ariaLabelHide="Hide new password"
            ariaLabelShow="Show new password"
          />

          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            wrapperClassName="settings-field settings-field-span"
            ariaLabelHide="Hide confirm password"
            ariaLabelShow="Show confirm password"
          />
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
      </div>
    </div>
  );
}
