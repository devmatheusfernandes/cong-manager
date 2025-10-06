import { BottomNavigation } from "@/components/bottom-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <h1 className="text-lg font-semibold">Congregação Central</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}