import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - TMS Dashboard",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-4">
          <div className="text-xl font-bold text-slate-900">Privacy Policy</div>
          <div className="text-sm text-slate-600">
            This is a placeholder privacy policy. It will explain what data we collect (like your
            name and email), how it is used (to create and manage your account), and how you can
            request changes or deletion.
          </div>
          <div className="text-sm text-slate-600">
            For now: we only use your details to operate the app. Replace this text with your real
            policy.
          </div>
          <div>
            <Link href="/register" className="text-[var(--primary-blue)] font-medium">
              Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
