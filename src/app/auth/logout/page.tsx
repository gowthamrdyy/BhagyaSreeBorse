"use client";

import { Loader } from "@/app/app/components/loader";
import { getLogout } from "@/server/action";
import { getCookie } from "@/utils/getCookieClient";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";
import Cookies from "js-cookie";

const Page = () => {
  useEffect(() => {
    const Clear = async () => {
      const cookie = getCookie();
      if (cookie) {
        await getLogout(cookie);
        Object.keys(Cookies.get()).forEach((cookieName) => {
          Cookies.remove(cookieName);
        });
      }
      window.localStorage.clear();
      return redirect("/auth/login");
    };
    Clear();
  }, []);

  return (
    <div className="w-dvw h-dvh items-center justify-center flex flex-col  gap-4 ">
      <Loader className="w-8 h-8 " />
      <h1 className="text-xl text-foreground/50 animate-pulse">Logging Out</h1>
    </div>
  );
};

export default Page;
