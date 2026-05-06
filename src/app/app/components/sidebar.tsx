import { useScreen } from "@/hooks/zustand";
import { SidebarToggle } from "@/utils/sidebarToggle";
import {
  BookCopy,
  BookOpenText,
  Calendar1,
  CalendarClock,
  CircleUserRound,
  Hourglass,
  MessageCircle,
  X,
  GraduationCap,
  Users,
  Gamepad2,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const iconSrc = "/bhagyasree.png";

type MenuType = {
  name: string;
  url: string;
  icon: React.JSX.Element;
}[];

const Sidebar = () => {
  return (
    <div className="relative h-full w-full flex flex-col bg-background border-r border-border overflow-hidden rounded-r-2xl">
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        <Menu />
        <Footer />
      </div>
    </div>
  );
};

export default Sidebar;

const Header = () => {
  const { isMobile } = useScreen();

  return (
    <div className={`flex px-6 pt-8 pb-4 items-center gap-3 ${isMobile ? "justify-between" : "justify-center"}`}>
      <div className="flex flex-col items-center justify-center group cursor-pointer">
        <div className="relative mb-4">
          <div className="relative z-10 p-3.5 rounded-xl bg-secondary border border-border group-hover:bg-accent transition-colors duration-200">
            <Image
              src={iconSrc}
              width={32}
              height={32}
              alt="BhagyaSreeBorse"
              priority
              className="transition-transform duration-300"
            />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-wide text-foreground">
          BhagyaSreeBorse
        </h1>
      </div>
      {isMobile && (
        <button className="absolute top-4 right-4 p-2 rounded-full bg-secondary border border-border hover:bg-accent transition-all">
          <X onClick={SidebarToggle} className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};

const Menu = () => {
  const path = usePathname();
  const item: MenuType = [
    {
      name: "Dashboard",
      url: "/app/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Timetable",
      url: "/app/timetable",
      icon: <Hourglass className="w-5 h-5" />,
    },
    {
      name: "Attendance",
      url: "/app/attendance",
      icon: <CalendarClock className="w-5 h-5" />,
    },
    {
      name: "Marks",
      url: "/app/marks",
      icon: <BookOpenText className="w-5 h-5" />,
    },
    {
      name: "Compare Marks",
      url: "/app/marks-compare",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Courses",
      url: "/app/course",
      icon: <BookCopy className="w-5 h-5" />,
    },
    {
      name: "Calendar",
      url: "/app/calendar",
      icon: <Calendar1 className="w-5 h-5" />,
    },
    {
      name: "Exams",
      url: "/app/exams",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      name: "Chat Room",
      url: "/app/chat",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      name: "Resources",
      url: "/app/ct-pyq",
      icon: <BookCopy className="w-5 h-5" />,
    },
    {
      name: "Profile",
      url: "/app/profile",
      icon: <CircleUserRound className="w-5 h-5" />,
    },
    {
      name: "Fun Zone",
      url: "/app/fun-zone",
      icon: <Gamepad2 className="w-5 h-5" />,
    },
    {
      name: "Configuration",
      url: "/app/configuration",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
  ];

  return (
    <div className="px-4 py-2 flex-1 flex flex-col overflow-y-auto space-y-1.5 scrollbar-hide">
      {item.map((i, index) => {
        const isActive = i.url === path;

        return (
          <Link
            key={i.name}
            href={i.url}
            onClick={SidebarToggle}
            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            <div>
              {i.icon}
            </div>
            <span className="text-sm flex-1">{i.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

const Footer = () => {
  return (
    <div className="p-4 border-t border-border bg-background space-y-3">
      <Link href="/auth/logout" className="block w-full">
        <div className="flex justify-center items-center gap-2 w-full py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </div>
      </Link>
      <div className="flex items-center justify-center gap-1.5 py-1">
        <span className="text-[10px] text-muted-foreground/40 tracking-widest uppercase font-medium">crafted by</span>
        <span className="text-[10px] font-black tracking-tight text-foreground/60">gowthamrdyy</span>
      </div>
    </div>
  );
};
