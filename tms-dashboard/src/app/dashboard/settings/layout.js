"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Key, UserCircle, Buildings } from "@phosphor-icons/react";

const linkClass = (active) => `settings-nav-link${active ? " active" : ""}`;

export default function SettingsLayout({ children }) {
  const pathname = usePathname() || "";

  return (
    <div className="settings-shell">
      <aside className="settings-nav">
        <div className="settings-nav-header">Settings</div>

        <div className="settings-nav-group">
          <div className="settings-nav-group-title">My account</div>
          <Link className={linkClass(pathname.startsWith("/dashboard/settings/profile"))} href="/dashboard/settings/profile">
            <UserCircle size={18} weight="fill" />
            <span>Profile</span>
          </Link>
          <Link className={linkClass(pathname.startsWith("/dashboard/settings/password"))} href="/dashboard/settings/password">
            <Key size={18} weight="fill" />
            <span>Password</span>
          </Link>
          <Link className={linkClass(pathname.startsWith("/dashboard/settings/language"))} href="/dashboard/settings/language">
            <Globe size={18} weight="fill" />
            <span>Language</span>
          </Link>
        </div>

        <div className="settings-nav-group">
          <div className="settings-nav-group-title">Organization</div>
          <Link className={linkClass(pathname.startsWith("/dashboard/settings/company"))} href="/dashboard/settings/company">
            <Buildings size={18} weight="fill" />
            <span>Company</span>
          </Link>
        </div>
      </aside>

      <section className="settings-content">{children}</section>
    </div>
  );
}
