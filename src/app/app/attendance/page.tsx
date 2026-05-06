"use client";
import React from "react";
import { useAttendance } from "@/hooks/query";
import { AttendanceDetail } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { AbsencePredictor } from "../components/AbsencePredictor";

const Page = () => {
  const { data, isPending } = useAttendance();

  const sorted = data ? [...data].sort((a: AttendanceDetail, b: AttendanceDetail) => Number(a.courseAttendance) - Number(b.courseAttendance)) : [];
  const avg = data && data.length > 0 ? (data.reduce((s: number, c: AttendanceDetail) => s + Number(c.courseAttendance), 0) / data.length).toFixed(1) : null;

  return (
    <div className="w-full h-full overflow-y-auto pb-8">

      {/* Sticky header — always visible */}
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between py-2 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {data ? `${data.length} subjects · sorted by lowest` : "Attendance"}
          </p>
          <AbsencePredictor />
        </div>
        <p className="text-xs text-muted-foreground">
          avg <span className="text-base font-black text-foreground tabular-nums">{avg ?? "—"}</span>
          {avg && "%"}
        </p>
      </div>

      {isPending && <GlobalLoader className="h-10 w-10 text-foreground mx-auto mt-20" />}
      {!isPending && (!data || data.length === 0) && (
        <div className="flex h-32 w-full justify-center items-center text-muted-foreground text-sm">No attendance data</div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((item: AttendanceDetail) => {
          const pct = Number(item.courseAttendance);
          const attended = item.courseConducted - item.courseAbsent;
          const isRisk = item.courseAttendanceStatus?.status === "required";
          const isGood = pct >= 85;
          const color = isRisk ? "#ef4444" : isGood ? "#22c55e" : "#eab308";

          return (
            <div key={item.courseCode} className="relative border border-border overflow-hidden" style={{ borderLeftColor: color, borderLeftWidth: 4 }}>

              {/* Tinted fill bar in background */}
              <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color, opacity: 0.05 }} />

              <div className="relative flex items-center gap-4 px-4 py-4">
                {/* Subject name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-snug">{item.courseTitle}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {attended} attended &nbsp;·&nbsp; {item.courseAbsent} absent &nbsp;·&nbsp; {item.courseConducted} total
                  </p>
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <span className="text-2xl font-black tabular-nums leading-none" style={{ color }}>{pct}%</span>
                  {item.courseAttendanceStatus && (
                    <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
                      {isRisk ? `need ${item.courseAttendanceStatus.classes} more` : `can skip ${item.courseAttendanceStatus.classes}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
