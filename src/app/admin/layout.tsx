import AdminHeader from "@/components/layout/AdminHeader";

// Admin pages have their own standalone layout — no consumer Header or Footer
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
