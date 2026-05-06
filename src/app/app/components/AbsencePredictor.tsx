"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calculator, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useAttendance, useTimetable } from "@/hooks/query";
import { AttendanceDetail, DaySchedule } from "@/types/api";
import { academicCalendar } from "@/data/calendarData";

// ── helpers ──────────────────────────────────────────────────────────────────

function getDayOrder(date: Date): string {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const yr = date.getFullYear().toString().slice(-2);
  const key = `${monthNames[date.getMonth()]} '${yr}`;
  const m = academicCalendar.find(mo => mo.month === key);
  if (!m) return "-";
  const d = m.days.find(d => d.date === String(date.getDate()));
  return d?.dayOrder ?? "-";
}

function dateRange(from: Date, to: Date): Date[] {
  const list: Date[] = [];
  const cur = new Date(from); cur.setHours(0,0,0,0);
  const end = new Date(to);   end.setHours(0,0,0,0);
  while (cur <= end) { list.push(new Date(cur)); cur.setDate(cur.getDate()+1); }
  return list;
}

function countClasses(dates: Date[], timetable: DaySchedule[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    const doStr = getDayOrder(d);
    if (doStr === "-") continue;
    const sched = timetable.find(t => t.dayOrder.split(" ").pop() === doStr);
    if (!sched) continue;
    for (const slot of sched.class) {
      if (slot.isClass && slot.courseCode) {
        counts[slot.courseCode] = (counts[slot.courseCode] ?? 0) + 1;
      }
    }
  }
  return counts;
}

function toInputDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtDate(s: string) {
  const d = new Date(s+"T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── mini calendar ─────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const MiniCalendar = ({ value, onChange, min, max }: {
  value: string; onChange: (v: string) => void; min: string; max: string;
}) => {
  const init = value ? new Date(value+"T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());

  const selected = value ? new Date(value+"T00:00:00") : null;
  const minD = new Date(min+"T00:00:00");
  const maxD = new Date(max+"T00:00:00");

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const cells: (number|null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => viewMonth === 0 ? (setViewYear(y=>y-1), setViewMonth(11)) : setViewMonth(m=>m-1);
  const nextMonth = () => viewMonth === 11 ? (setViewYear(y=>y+1), setViewMonth(0)) : setViewMonth(m=>m+1);

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <button onClick={prevMonth} className="p-1 hover:bg-accent rounded transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-accent rounded transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 px-2 pt-2">
        {["M","T","W","T","F","S","S"].map((d,i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground pb-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-2 pb-2 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const thisDate = new Date(viewYear, viewMonth, day);
          const isSel = selected && thisDate.getTime() === selected.getTime();
          const isDisabled = thisDate < minD || thisDate > maxD;
          const isHoliday = getDayOrder(thisDate) === "-";
          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => onChange(toInputDate(thisDate))}
              className={`h-7 w-full text-[11px] font-bold rounded transition-colors tabular-nums ${
                isSel
                  ? "bg-foreground text-background"
                  : isDisabled
                  ? "text-muted-foreground/25 cursor-not-allowed"
                  : isHoliday
                  ? "text-destructive/50 hover:bg-accent"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── types ─────────────────────────────────────────────────────────────────────

type Result = {
  courseCode: string;
  courseTitle: string;
  currentPct: number;
  predictedPct: number;
  classesMissed: number;
  classesNeeded: number;
};

const today = new Date(); today.setHours(0,0,0,0);
const MIN_DATE = "2026-01-08";
const MAX_DATE = "2026-05-06";

// ── modal content ─────────────────────────────────────────────────────────────

const PredictorModal = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<"from"|"until">("from");
  const [fromDate, setFromDate] = useState(toInputDate(today));
  const [toDate, setToDate]     = useState(toInputDate(today));
  const [results, setResults]   = useState<Result[] | null>(null);
  const [step, setStep]         = useState<"pick"|"results">("pick");

  const { data: attendance } = useAttendance();
  const { data: timetable }  = useTimetable();

  const calculate = () => {
    if (!attendance || !timetable) return;
    const from = new Date(fromDate+"T00:00:00");
    const to   = new Date(toDate+"T00:00:00");
    if (from > to) return;

    const beforeDates = from > today ? dateRange(today, new Date(from.getTime() - 86400000)) : [];
    const absentDates = dateRange(from, to);
    const beforeCounts = countClasses(beforeDates, timetable);
    const absentCounts = countClasses(absentDates, timetable);

    const res: Result[] = attendance.map((sub: AttendanceDetail) => {
      const code    = sub.courseCode;
      const newCond = sub.courseConducted + (beforeCounts[code] ?? 0) + (absentCounts[code] ?? 0);
      const newAbs  = sub.courseAbsent + (absentCounts[code] ?? 0);
      const att     = newCond - newAbs;
      const pct     = newCond > 0 ? (att / newCond) * 100 : 0;
      const needed  = Math.ceil(Math.max(0, 3 * newCond - 4 * att));
      const canSkip = pct >= 75 ? Math.floor((4 * att - 3 * newCond) / 3) : 0;
      return {
        courseCode:    code,
        courseTitle:   sub.courseTitle,
        currentPct:    Number(sub.courseAttendance),
        predictedPct:  Math.round(pct * 10) / 10,
        classesMissed: absentCounts[code] ?? 0,
        classesNeeded: pct >= 75 ? -canSkip : needed,
      };
    });

    setResults(res.sort((a,b) => a.predictedPct - b.predictedPct));
    setStep("results");
  };

  return (
    <div className="relative mt-auto w-full bg-background border-t border-border flex flex-col"
      style={{ maxHeight: "80vh" }}
    >
      {/* ── HEADER ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {step === "results" && (
            <button onClick={() => setStep("pick")} className="p-1 hover:bg-accent rounded transition-colors mr-1">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Attendance</p>
            <p className="text-base font-black text-foreground leading-none">Absence Predictor</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-accent rounded transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* ── STEP: PICK DATES ── */}
      {step === "pick" && (
        <>
          {/* Hint */}
          <p className="flex-shrink-0 text-[10px] text-muted-foreground px-4 pt-2">
            Attends <span className="text-foreground font-bold">all classes</span> today → absence start. Misses all during absence.
          </p>

          {/* From / Until tabs */}
          <div className="flex-shrink-0 flex border-b border-border mt-2">
            <button
              onClick={() => setActiveTab("from")}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                activeTab === "from"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              From · <span className="font-black tabular-nums">{fmtDate(fromDate)}</span>
            </button>
            <button
              onClick={() => setActiveTab("until")}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                activeTab === "until"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Until · <span className="font-black tabular-nums">{fmtDate(toDate)}</span>
            </button>
          </div>

          {/* Calendar */}
          <div className="flex-shrink-0">
            {activeTab === "from" ? (
              <MiniCalendar
                value={fromDate}
                min={MIN_DATE}
                max={MAX_DATE}
                onChange={v => { setFromDate(v); if (v > toDate) setToDate(v); setActiveTab("until"); }}
              />
            ) : (
              <MiniCalendar
                value={toDate}
                min={fromDate}
                max={MAX_DATE}
                onChange={v => setToDate(v)}
              />
            )}
          </div>

          {/* Calculate */}
          <div className="flex-shrink-0 px-4 pb-6 pt-3">
            <button
              onClick={calculate}
              className="w-full py-3 bg-foreground text-background text-sm font-black hover:opacity-80 transition-opacity flex items-center justify-center gap-2 rounded"
            >
              <Calculator className="w-4 h-4" />
              Predict Impact · {fmtDate(fromDate)}{fromDate !== toDate ? ` → ${fmtDate(toDate)}` : ""}
            </button>
          </div>
        </>
      )}

      {/* ── STEP: RESULTS ── */}
      {step === "results" && results && (
        <div className="flex-1 overflow-y-auto">
          {/* Summary */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-accent/20 flex-shrink-0">
            <p className="text-[10px] text-muted-foreground">
              {fmtDate(fromDate)}{fromDate !== toDate ? ` → ${fmtDate(toDate)}` : ""}
            </p>
            <div className="ml-auto flex gap-3">
              <span className="text-[10px] text-destructive font-bold">{results.filter(r=>r.classesNeeded>0).length} at risk</span>
              <span className="text-[10px] text-green-500 font-bold">{results.filter(r=>r.classesNeeded<=0).length} safe</span>
            </div>
          </div>

          <div className="divide-y divide-border pb-10">
            {results.map(r => {
              const color = r.predictedPct >= 75 ? "#22c55e" : r.predictedPct >= 60 ? "#eab308" : "#ef4444";
              const drop  = (r.predictedPct - r.currentPct).toFixed(1);
              return (
                <div key={r.courseCode} className="relative flex items-center gap-3 px-4 py-3" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: color, opacity: 0.03 }} />
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-snug truncate">{r.courseTitle}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-muted-foreground tabular-nums">{r.currentPct}%</span>
                      <span className="text-[10px] text-muted-foreground">→</span>
                      <span className="text-sm font-black tabular-nums" style={{ color }}>{r.predictedPct}%</span>
                      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>({Number(drop) > 0 ? `+${drop}` : drop}%)</span>
                      {r.classesMissed > 0 && <span className="text-[10px] text-muted-foreground">{r.classesMissed} missed</span>}
                    </div>
                    <div className="mt-1.5 h-[2px] w-full bg-border overflow-hidden rounded">
                      <div className="h-full rounded" style={{ width: `${Math.min(r.predictedPct,100)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <div className="relative flex-shrink-0 flex flex-col items-end min-w-[52px]">
                    {r.classesNeeded > 0 ? (
                      <>
                        <span className="text-xl font-black tabular-nums text-destructive leading-none">{r.classesNeeded}</span>
                        <span className="text-[9px] text-muted-foreground">to recover</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-black tabular-nums text-green-500 leading-none">{Math.abs(r.classesNeeded)}</span>
                        <span className="text-[9px] text-muted-foreground">can skip</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predict again button */}
          <div className="sticky bottom-0 px-4 pb-6 pt-2 bg-background border-t border-border">
            <button
              onClick={() => setStep("pick")}
              className="w-full py-2.5 border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors rounded flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Predict Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── exported component ────────────────────────────────────────────────────────

export const AbsencePredictor = ({ compact = false }: { compact?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleOpen  = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const trigger = (
    <button
      onClick={handleOpen}
      className={compact
        ? "p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded"
        : "flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      }
      title="Absence Predictor"
    >
      <Calculator className="w-3.5 h-3.5" />
      {!compact && "Predictor"}
    </button>
  );

  const modal = open && (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", flexDirection:"column" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} onClick={handleClose} />
      <PredictorModal onClose={handleClose} />
    </div>
  );

  return (
    <>
      {trigger}
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
};

// ── standalone dashboard card ─────────────────────────────────────────────────

export const AbsencePredictorCard = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const modal = open && (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", flexDirection:"column" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} onClick={() => setOpen(false)} />
      <PredictorModal onClose={() => setOpen(false)} />
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2.5 px-3 py-2.5 border border-border hover:bg-accent transition-colors w-full text-left"
      >
        <Calculator className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Absence Predictor</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Predict attendance if you skip</p>
        </div>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0" />
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
};
