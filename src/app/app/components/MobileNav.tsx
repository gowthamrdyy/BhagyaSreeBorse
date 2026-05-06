"use client";
import React, { useRef, useLayoutEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, Hourglass, CalendarCheck2, BookOpenText, CalendarDays, UserRound,
} from "lucide-react";

const NAV = [
  { href: "/app/dashboard",  Icon: Home,           label: "HOME"       },
  { href: "/app/timetable",  Icon: Hourglass,       label: "TABLE"      },
  { href: "/app/attendance", Icon: CalendarCheck2,  label: "ATTEND"     },
  { href: "/app/marks",      Icon: BookOpenText,    label: "MARKS"      },
  { href: "/app/calendar",   Icon: CalendarDays,    label: "CAL"        },
  { href: "/app/profile",    Icon: UserRound,       label: "MORE"       },
];

const MobileNav = () => {
  const router   = useRouter();
  const pathname = usePathname();
  const idx = Math.max(0, NAV.findIndex(n => pathname.startsWith(n.href)));

  const navRef  = useRef<HTMLDivElement | null>(null);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const totalW = nav.offsetWidth;
    const w = totalW / NAV.length;
    setSliderStyle({ left: idx * w, width: w });
  }, [idx]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div
        ref={navRef}
        className="pointer-events-auto relative border-t border-border bg-background flex"
      >
        {/* sliding accent highlight — subtle, not inverted */}
        {sliderStyle && (
          <motion.div
            className="absolute top-0 bottom-0 bg-accent/80 z-0 pointer-events-none"
            initial={{ left: sliderStyle.left, width: sliderStyle.width }}
            animate={{ left: sliderStyle.left, width: sliderStyle.width }}
            transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
          />
        )}
        {/* sliding top indicator line */}
        {sliderStyle && (
          <motion.div
            className="absolute top-0 h-[2px] bg-foreground z-10 pointer-events-none"
            initial={{ left: sliderStyle.left, width: sliderStyle.width }}
            animate={{ left: sliderStyle.left, width: sliderStyle.width }}
            transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
          />
        )}

        {NAV.map((item, i) => {
          const isActive = i === idx;
          const { Icon } = item;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="relative z-10 flex-1 flex flex-col items-center justify-center gap-[3px] py-3 border-r border-border last:border-r-0 transition-none"
              style={{ minWidth: 0 }}
            >
              <Icon
                style={{
                  width: 17,
                  height: 17,
                  strokeWidth: isActive ? 2.4 : 1.7,
                  color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  opacity: isActive ? 1 : 0.5,
                  transition: "opacity 0.15s",
                }}
              />
              <span
                style={{
                  fontSize: 7,
                  fontWeight: isActive ? 900 : 600,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  opacity: isActive ? 1 : 0.5,
                  transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
