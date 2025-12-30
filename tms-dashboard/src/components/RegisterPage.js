"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import { UserCircle } from "@phosphor-icons/react";
import TextInput from "@/components/TextInput";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const avatarInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());

  const initials = useMemo(() => {
    const f = String(firstName || "").trim();
    const l = String(lastName || "").trim();
    const a = f ? f[0].toUpperCase() : "";
    const b = l ? l[0].toUpperCase() : "";
    return `${a}${b}`;
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

    const next = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };
    if (!String(firstName || "").trim()) next.firstName = "Please enter a first name.";
    if (!String(lastName || "").trim()) next.lastName = "Please enter a last name.";
    if (!String(email || "").trim()) next.email = "Please enter an email address.";
    else if (!isValidEmail(email)) next.email = "Please enter a valid email address.";
    if (!String(password || "").trim()) next.password = "Please enter a password.";
    if (!String(confirmPassword || "").trim()) next.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) next.confirmPassword = "Passwords do not match.";

    setFieldErrors(next);

    const hasErrors = Object.values(next).some(Boolean);
    if (hasErrors) return;

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

      const role = String(data?.user?.role || "admin");
      const hasCompany = Boolean(data?.user?.company);

      // Clear any stale persistent auth before writing new state.
      try {
        window.localStorage.removeItem("tms_token");
        window.localStorage.removeItem("tms_user");
      } catch {
        // ignore
      }

      // If the user hasn't created a company yet, keep auth in sessionStorage
      // so the account isn't persisted until onboarding is complete.
      const persist = role === "driver" || hasCompany;
      if (data?.token) {
        if (persist) window.localStorage.setItem("tms_token", data.token);
        else window.sessionStorage.setItem("tms_onboarding_token", data.token);
      }
      if (data?.user) {
        if (persist) window.localStorage.setItem("tms_user", JSON.stringify(data.user));
        else window.sessionStorage.setItem("tms_onboarding_user", JSON.stringify(data.user));
      }

      if (role === "driver") {
        router.push("/unauthorized");
      } else if (!hasCompany) {
        router.push("/create-company");
      } else {
        router.push("/dashboard/orders");
      }
    } catch (e) {
      const message = String(e?.data?.message || e?.message || "Registration failed");
      const field = String(e?.data?.field || "");
      const code = String(e?.data?.code || "");

      if (field === "email" || code === "EMAIL_IN_USE" || /email already in use/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already in use." }));
        return;
      }

      // Fallback: map common backend required-field message.
      if (/firstName/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, firstName: "Please enter a first name." }));
        return;
      }
      if (/lastName/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, lastName: "Please enter a last name." }));
        return;
      }
      if (/\bemail\b/i.test(message)) {
        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
        return;
      }
      if (/password/i.test(message)) {
        setFieldErrors((prev) => ({
          ...prev,
          password: prev.password || "Please enter a password.",
        }));
        return;
      }

      setError(message);
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

          <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-slate-700">Profile Picture (Optional)</label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 font-semibold">
                  {avatarPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreviewUrl} alt="Profile picture" className="h-full w-full object-cover" />
                  ) : initials ? (
                    <span>{initials}</span>
                  ) : (
                    <UserCircle size={28} weight="fill" className="text-slate-300" />
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
                    className="h-9 px-5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold tracking-wide hover:bg-slate-50 hover:border-slate-300"
                    style={{ paddingLeft: 16, paddingRight: 16 }}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    UPLOAD IMAGE
                  </button>

                  <button
                    type="button"
                    disabled={!avatarFile}
                    className="h-9 px-5 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-semibold tracking-wide hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 disabled:hover:bg-white disabled:hover:border-slate-200"
                    style={{ paddingLeft: 16, paddingRight: 16 }}
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

            <TextInput
              label="First name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFieldErrors((p) => ({ ...p, firstName: "" }));
                setError("");
              }}
              placeholder="First name"
              error={fieldErrors.firstName}
            />

            <TextInput
              label="Last name"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setFieldErrors((p) => ({ ...p, lastName: "" }));
                setError("");
              }}
              placeholder="Last name"
              error={fieldErrors.lastName}
            />

            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((p) => ({ ...p, email: "" }));
                setError("");
              }}
              placeholder="you@company.com"
              error={fieldErrors.email}
            />

            <PasswordInput
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, password: "", confirmPassword: "" }));
                setError("");
              }}
              error={fieldErrors.password}
              ariaLabelHide="Hide password"
              ariaLabelShow="Show password"
            />

            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                setError("");
              }}
              error={fieldErrors.confirmPassword}
              ariaLabelHide="Hide confirm password"
              ariaLabelShow="Show confirm password"
            />

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
              <Link href="/terms" className="text-[var(--primary-blue)] font-medium">
                Terms and Conditions
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
