"use client";

import React, { useMemo } from "react";
import {
  Calendar, Clock, Award, CheckCircle2,
  BookOpen, Calculator, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useUserInfo, useTimetable, useDayOrder, useAttendance, useMarks } from "@/hooks/query";
import { useNicknameStore } from "@/hooks/zustand";
import { DaySchedule } from "@/types/api";
import { AbsencePredictor, AbsencePredictorCard } from "@/app/app/components/AbsencePredictor";

const DashboardPage = () => {
  const { data: userInfo } = useUserInfo();
  const { nickname } = useNicknameStore();
  const { data: timetable } = useTimetable();
  const { data: dayOrderData } = useDayOrder();
  const { data: attendance } = useAttendance();
  const { data: marks } = useMarks();

  const todayClasses = useMemo(() => {
    if (!timetable || !dayOrderData) return [];
    const getNum = (str: string) => { const m = str.toString().match(/\d+/); return m ? m[0] : str; };
    const cur = getNum(dayOrderData.dayOrder || "1");
    const schedule = timetable.find((d: DaySchedule) => getNum(d.dayOrder || "") === cur);
    if (!schedule?.class) return [];
    return schedule.class.filter((c: { isClass: boolean }) => c.isClass);
  }, [timetable, dayOrderData]);

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    if (!attendance || attendance.length === 0) return null;
    const avg = attendance.reduce((s: number, c: { courseAttendance: string }) => s + Number(c.courseAttendance), 0) / attendance.length;
    return { avg: avg.toFixed(1) };
  }, [attendance]);

  // Marks summary
  const marksSummary = useMemo(() => {
    if (!marks || marks.length === 0) return null;
    const obtained = marks.reduce((s: number, m: { total: { obtained: number } }) => s + (m.total?.obtained ?? 0), 0);
    const max = marks.reduce((s: number, m: { total: { maxMark: number } }) => s + (m.total?.maxMark ?? 0), 0);
    return { obtained, max };
  }, [marks]);

  const features = [
    { label: "Timetable", href: "/app/timetable", icon: Clock, desc: "View your schedule" },
    { label: "Attendance", href: "/app/attendance", icon: CheckCircle2, desc: "Track your classes" },
    { label: "Marks", href: "/app/marks", icon: Award, desc: "Exam results" },
    { label: "SGPA Predictor", href: "/app/sgpa", icon: Calculator, desc: "Calculate your GPA" },
    { label: "Courses", href: "/app/course", icon: BookOpen, desc: "Your subjects" },
    { label: "Calendar", href: "/app/calendar", icon: Calendar, desc: "Events & exams" },
  ];

  const displayName = nickname || userInfo?.name?.split(" ")[0] || "Student";

  return (
    <div className="w-full h-full flex flex-col max-w-2xl mx-auto gap-3 overflow-y-auto pb-4 pr-0.5">

      {/* Welcome */}
      <div className="space-y-0.5 flex-shrink-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Day Order {dayOrderData?.dayOrder || "—"}
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Hey, {displayName}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid gap-2 flex-shrink-0" style={{ gridTemplateColumns: "1fr 1fr 1.6fr" }}>
        <div className="border border-border p-3 space-y-0.5">
          <p className="text-xl font-bold text-foreground tabular-nums">{todayClasses.length}</p>
          <p className="text-[10px] text-muted-foreground">Classes today</p>
        </div>
        <div className="border border-border p-3 space-y-0.5">
          <p className="text-xl font-bold text-foreground tabular-nums">
            {attendanceSummary ? `${attendanceSummary.avg}%` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Avg attendance</p>
        </div>
        <div className="border border-border p-3 space-y-0.5">
          <p className="text-foreground tabular-nums leading-none">
            <span className="text-3xl font-bold">{marksSummary ? marksSummary.obtained.toFixed(1) : "—"}</span>
            {marksSummary && <span className="text-sm text-muted-foreground font-medium ml-0.5">/{marksSummary.max}</span>}
          </p>
          <p className="text-[10px] text-muted-foreground">Total marks</p>
        </div>
      </div>

      {/* Today's classes */}
      {todayClasses.length > 0 && (
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Today</p>
          <div className="border border-border divide-y divide-border">
            {todayClasses.map((c: { courseTitle?: string; time?: string }, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-foreground truncate flex-1 mr-4">{c.courseTitle}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">{c.time || ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Quick access</p>
        <div className="grid grid-cols-1 gap-1.5">
          <AbsencePredictorCard />
          {features.map((f, i) => (
            <Link
              key={i}
              href={f.href}
              className="group flex items-center gap-2.5 px-3 py-2.5 border border-border hover:bg-accent transition-colors"
            >
              <f.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{f.label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{f.desc}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
