import Link from "next/link";

export const metadata = {
  title: "Policy - TMS Dashboard",
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-4">
          <div className="text-xl font-bold text-slate-900">Policy</div>
          <div className="text-sm text-slate-600">
            This is a placeholder policy page. Add your terms, acceptable use, and account rules
            here.
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
