"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a primeira tab (nomes-datas) por padrão
    router.replace("/dashboard/nomes-datas");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );
}
