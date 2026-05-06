
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Sidebar from "./sidebar";
import MobileNav from "./MobileNav";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { useScreen, useNicknameStore } from "@/hooks/zustand";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Bell,
  Search,
  Skull
} from "lucide-react";
import { useUserInfo } from "@/hooks/query";
import Loading from "../loading";
import Loader from "@/components/ui/loader-11"; // Updated import
import UserProfilePopover from "./user-profile-popover";
import { NicknameModal } from "./NicknameModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useScreen();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      try {
        const localStoragePersister = createAsyncStoragePersister({
          storage: window.localStorage,
        });
        persistQueryClient({
          persister: localStoragePersister,
          queryClient,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          buster: "v1.0.3", // Incremented for fresh cache on layout update
        });
      } catch (error) {
        console.warn('Failed to setup query persistence:', error);
      }
    }
  }, [isClient]);

  if (!isClient) return <Loading />;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex w-dvw h-dvh p-0 overflow-hidden bg-background text-foreground">

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-[280px] h-full p-4 pr-0">
            <Sidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 pb-14 md:pb-6 scroll-smooth">
            <MenuBar />
            <main className="flex-1 mt-4 overflow-hidden">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          {isMobile && <MobileNav />}
        </div>
      </div>
      <NicknameModal />
    </QueryClientProvider>
  );
};

export default QueryProvider;

const MenuBar = () => {
  const { data } = useUserInfo();
  const { nickname } = useNicknameStore();
  const path = usePathname().split("/");
  const currentPath = path[path.length - 1];
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Changed from glitching to loading

  const handleDangerClick = () => {
    setLoading(true);
    // User requested 3-4 seconds
    setTimeout(() => {
      router.push("/app/about");
      // Stop loading shortly after nav, or let unmount handle it
      setTimeout(() => setLoading(false), 500);
    }, 2000);
  };

  return (
    <>
      <Loader isActive={loading} />
      <div className="w-full flex justify-between items-center py-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold capitalize text-foreground tracking-tight">{currentPath.replace("-", " ")}</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {nickname || data?.name?.split(" ")[0] || "Student"}</p>
        </div>

        <div className="flex items-center gap-4">
          <UserProfilePopover />
        </div>
      </div>
    </>
  );
};
