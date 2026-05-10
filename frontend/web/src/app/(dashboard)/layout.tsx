import { AppProviders } from "@/context";
import { Sidebar } from "@/app/components/dashboard/Sidebar";
import { TopBar } from "@/app/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-obsidian-bg">
        <Sidebar />
        <TopBar />
        <main className="pl-48 pt-14 min-h-screen">
          <div className="p-6 max-w-[1200px]">{children}</div>
        </main>
      </div>
    </AppProviders>
  );
}
