export default function DashboardLayout({ children }) {
  return (
    <section className="flex flex-col h-full min-h-0 overflow-hidden">
      {children}
    </section>
  );
}
