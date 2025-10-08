"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o dashboard automaticamente
    router.replace("/dashboard/mecanicas");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
