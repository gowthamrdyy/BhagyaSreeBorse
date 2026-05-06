"use client";
import { useCalendar } from "@/hooks/query";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Month } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { formattedMonth, getIndex } from "@/utils/currentMonth";

const Page = () => {
  const { data, isPending } = useCalendar();
  if (isPending) return <GlobalLoader className="h-10 w-10 text-foreground" />;
  if (!data || data.length === 0)
    return <div className="flex h-full w-full justify-center items-center text-muted-foreground text-sm">No calendar data found</div>;
  return <CalendarView data={data} />;
};

export default Page;

const CalendarView = ({ data }: { data: Month[] }) => {
  const initialIndex = Math.max(0, getIndex({ data }));
  const [month, setMonth] = useState<number>(initialIndex);
  const currentMonthData = data[month];

  // summary counts
  const holidays = currentMonthData.days.filter(d => d.dayOrder === "-" && d.event).length;
  const classDays = currentMonthData.days.filter(d => d.dayOrder !== "-").length;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Header strip ── */}
      <div className="flex-shrink-0 flex items-center justify-between py-3 border-b border-border">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Academic Calendar</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-foreground leading-none whitespace-nowrap">{currentMonthData.month}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              <span className="text-foreground font-bold">{classDays}</span> class · <span className="text-foreground font-bold">{holidays}</span> holidays
            </span>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center border border-border overflow-hidden">
          <button
            onClick={() => { if (month > 0) setMonth(month - 1); }}
            disabled={month === 0}
            className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30 border-r border-border"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {/* Month pills — hidden on mobile, visible on md+ */}
          <div className="hidden md:flex">
            {data.map((m, i) => (
              <button
                key={i}
                onClick={() => setMonth(i)}
                className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors border-r border-border ${
                  i === month
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {m.month.split(" ")[0]}
              </button>
            ))}
          </div>
          {/* Mobile: just show current month label */}
          <span className="md:hidden px-3 py-1.5 text-xs font-bold text-foreground border-r border-border min-w-[64px] text-center">
            {currentMonthData.month.split(" ")[0]}
          </span>
          <button
            onClick={() => { if (month < data.length - 1) setMonth(month + 1); }}
            disabled={month === data.length - 1}
            className="p-1.5 hover:bg-accent transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Day list ── */}
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        <DayList data={data} month={month} />
      </div>
    </div>
  );
};

const DayList = ({ data, month }: { data: Month[]; month: number }) => {
  const today = new Date();
  const currentDate = today.getDate().toString();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [month]);

  return (
    <>
      {data[month].days.map((item, i) => {
        const isHoliday = item.dayOrder === "-";
        const hasEvent  = item.event.length > 0;
        const isCurrent = item.date === currentDate && formattedMonth === data[month].month;

        const color = isCurrent
          ? "var(--foreground)"
          : isHoliday && hasEvent
          ? "#ef4444"
          : "var(--muted-foreground)";

        const borderLeft = isCurrent
          ? "4px solid var(--foreground)"
          : isHoliday && hasEvent
          ? "4px solid #ef4444"
          : "4px solid transparent";

        return (
          <div
            key={i}
            ref={isCurrent ? currentRef : undefined}
            className={`relative flex items-center gap-4 px-4 py-2 border border-border transition-colors overflow-hidden ${
              isCurrent ? "bg-accent" : "hover:bg-accent/30"
            }`}
            style={{ borderLeft }}
          >
            {/* Background tint for current day */}
            {isCurrent && (
              <div className="absolute inset-0 pointer-events-none bg-foreground opacity-[0.04]" />
            )}

            {/* Date + day */}
            <div className="flex-shrink-0 w-12 flex flex-col items-center">
              <span className={`text-2xl font-black tabular-nums leading-none`} style={{ color }}>
                {item.date}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
                {item.day}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border flex-shrink-0" />

            {/* Event */}
            <div className="flex-1 min-w-0">
              {hasEvent ? (
                <p className="text-sm font-bold leading-snug" style={{ color }}>
                  {item.event}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">—</p>
              )}
            </div>

            {/* Day order badge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center border px-2 py-1 min-w-[36px]"
              style={{
                borderColor: isHoliday ? "#ef4444" : "var(--border)",
              }}
            >
              <span className={`text-sm font-black leading-none ${isHoliday ? "text-destructive" : "text-foreground"}`}>
                {isHoliday ? "—" : item.dayOrder}
              </span>
              {!isHoliday && (
                <span className="text-[9px] text-muted-foreground mt-0.5">DO</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
