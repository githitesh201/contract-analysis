import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import DashboardLayout from "@/components/dashboard/sidebar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <DashboardLayout>
        <div className="flex flex-1 flex-col overflow-hidden">
          <MobileDashboardNav />
          <main className="premium-page flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </DashboardLayout>
    </ProtectedLayout>
  );
}
