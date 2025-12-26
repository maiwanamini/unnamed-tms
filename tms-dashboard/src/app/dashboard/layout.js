"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Overlay from "@/components/Overlay";
import { apiFetch } from "@/lib/fetcher";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const me = await apiFetch("/users/me");
        if (cancelled) return;
        window.localStorage.setItem("tms_user", JSON.stringify(me));

        const role = String(me?.role || "admin");
        const hasCompany = Boolean(me?.company);
        if (role === "driver") {
          router.replace("/unauthorized");
          return;
        }
        if (!hasCompany) {
          router.replace("/create-company");
          return;
        }
        setReady(true);
      } catch {
        // Not logged in
        router.replace("/");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex flex-col flex-1 min-h-0 bg-[var(--background)] overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </main>
      <Overlay />
    </div>
  );
}
