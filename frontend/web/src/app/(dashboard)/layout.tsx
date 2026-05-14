import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import AuthGuard from "@/app/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
