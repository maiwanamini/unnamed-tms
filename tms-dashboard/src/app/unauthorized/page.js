"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl px-10 py-14">
        <div className="flex flex-col gap-3">
          <div className="text-xl font-bold text-slate-900">Unauthorized</div>
          <div className="text-sm text-slate-600">
            Your account doesn’t have access to the dashboard. Please use the mobile app.
          </div>
          <div className="text-sm text-slate-600">
            <Link href="/" className="text-[var(--primary-blue)] font-medium">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
