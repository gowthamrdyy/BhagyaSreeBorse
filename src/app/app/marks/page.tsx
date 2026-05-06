"use client";
import { useCourse, useMarks } from "@/hooks/query";
import React, { useState } from "react";
import { MarkDetail, CourseDetail } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { SGPAPredictor } from "../components/SGPAPredictor";

const TOTAL_INTERNAL = 60;

const getGrade = (pct: number) => {
  if (pct >= 90) return { g: "O",  pts: 10, color: "#22c55e" };
  if (pct >= 80) return { g: "A+", pts: 9,  color: "#22c55e" };
  if (pct >= 70) return { g: "A",  pts: 8,  color: "#a3a3a3" };
  if (pct >= 60) return { g: "B+", pts: 7,  color: "#a3a3a3" };
  if (pct >= 50) return { g: "B",  pts: 6,  color: "#eab308" };
  if (pct >= 40) return { g: "C",  pts: 5,  color: "#eab308" };
  return              { g: "F",  pts: 0,  color: "#ef4444" };
};

const Page = () => {
  const { data: marksData, isPending: ml } = useMarks();
  const { data: courseData, isPending: cl } = useCourse();
  const [tab, setTab] = useState<"theory" | "practical">("theory");

  if (ml || cl) return <GlobalLoader className="h-10 w-10 text-foreground" />;
  if (!marksData || marksData.length === 0)
    return <div className="flex h-full w-full justify-center items-center text-muted-foreground text-sm">No marks data yet</div>;

  const theory    = marksData.filter((i: MarkDetail) => i.category.toLowerCase() === "theory");
  const practical = marksData.filter((i: MarkDetail) => i.category.toLowerCase() === "practical");
  const active    = tab === "theory" ? theory : practical;

  const totalObtained = marksData.reduce((s: number, m: MarkDetail) => s + (m.total?.obtained ?? 0), 0);
  const totalMax      = marksData.reduce((s: number, m: MarkDetail) => s + (m.total?.maxMark ?? 0), 0);
  const overallPct    = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Hero strip ── */}
      <div className="flex-shrink-0 flex items-end justify-between pb-4 border-b border-border">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Internal marks</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black tabular-nums text-foreground leading-none">{totalObtained.toFixed(0)}</span>
            <span className="text-xl text-muted-foreground font-semibold">/ {totalMax}</span>
          </div>
          <div className="mt-2 h-1 w-48 bg-border overflow-hidden">
            <div className="h-full bg-foreground" style={{ width: `${Math.min(overallPct, 100)}%` }} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {courseData && <SGPAPredictor marksData={marksData} courseData={courseData} />}
        </div>
      </div>

      {/* ── Tabs ── */}
      {practical.length > 0 && (
        <div className="flex-shrink-0 flex border-b border-border">
          {(["theory", "practical"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-xs font-bold capitalize border-b-2 transition-colors ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t} <span className="ml-1 text-muted-foreground font-normal">
                {t === "theory" ? theory.length : practical.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Subject list ── */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {active.map((item: MarkDetail, i: number) => {
          const course    = courseData?.find((c: CourseDetail) => c.courseCode === item.course);
          const remaining = TOTAL_INTERNAL - item.total.maxMark;
          const projected = item.total.obtained + remaining;
          const pct       = item.total.maxMark > 0 ? (projected / TOTAL_INTERNAL) * 100 : 0;
          const { g, pts, color } = item.total.maxMark > 0 ? getGrade(pct) : { g: "—", pts: 0, color: "#737373" };
          const barW      = item.total.maxMark > 0 ? Math.min((item.total.obtained / item.total.maxMark) * 100, 100) : 0;

          return (
            <div key={i} className="border border-border bg-card hover:bg-accent/30 transition-colors">

              {/* Subject name row */}
              <div className="flex items-start justify-between px-4 pt-3 pb-2 gap-3">
                <p className="text-sm font-bold text-foreground leading-snug flex-1">
                  {course?.courseTitle || item.course}
                </p>
                {/* Grade + GPA pts */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center border px-2.5 py-1.5 min-w-[44px]" style={{ borderColor: color }}>
                  <span className="text-base font-black leading-none tracking-tight" style={{ color }}>{g}</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">{pts > 0 ? `${pts}pt` : ""}</span>
                </div>
              </div>

              {/* Exam breakdown — column of boxes */}
              {item.marks.length > 0 && (
                <div className="px-4 pb-2 flex flex-col gap-1">
                  {item.marks.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between border border-border px-3 py-1.5 bg-background">
                      <span className="text-[11px] text-muted-foreground font-medium">{m.exam}</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-black tabular-nums text-foreground">{m.obtained}</span>
                        <span className="text-[10px] text-muted-foreground">/{m.maxMark}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total + bar */}
              <div className="px-4 pb-3 flex items-center gap-3">
                {/* Thin progress bar */}
                <div className="flex-1 h-[3px] bg-border overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${barW}%`, backgroundColor: color }} />
                </div>
                <span className="flex-shrink-0 text-xs font-black tabular-nums text-foreground">
                  {item.total.obtained}<span className="text-muted-foreground font-normal text-[10px]">/{item.total.maxMark}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
