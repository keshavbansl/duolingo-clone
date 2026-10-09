"use client";

import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { HomeResponse } from "@/lib/types";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const data = await apiFetch<HomeResponse>("/api/home/");
        if (isMounted) setHomeData(data);
      } catch {
        // Keep the layout usable if the API is temporarily unavailable.
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {homeData && (
        <TopBar
          courseName={homeData.course.name}
          language={homeData.course.language}
          xp={homeData.user.xp}
          streak={homeData.user.streak}
          hearts={homeData.user.hearts}
          gems={homeData.user.gems}
        />
      )}

      <div className="min-w-0 flex-1 pb-24">{children}</div>

      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}