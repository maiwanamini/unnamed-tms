import Sidebar from "@/components/Sidebar";
import Overlay from "@/components/Overlay";

export default function DashboardLayout({ children }) {
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
