import { Sidebar } from "@/app/components/dashboard/Sidebar";
import { TopBar } from "@/app/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface font-body h-screen w-full overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-full bg-[#1c1b1d] relative overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
