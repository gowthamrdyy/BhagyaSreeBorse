"use client";
import React, { useMemo } from "react";
import { useUserInfo, useMarks, useAttendance, useTimetable } from "@/hooks/query";
import { UserInfo, MarkDetail, AttendanceDetail, DaySchedule } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { LogOut, User } from "lucide-react";
import { useAvatarStore } from "@/hooks/use-avatar-store";
import { presetAvatars } from "@/lib/avatars";
import Link from "next/link";
import { AbsencePredictorCard } from "../components/AbsencePredictor";

const Page = () => {
  const { data, isPending } = useUserInfo();
  if (isPending) return <GlobalLoader className="h-10 w-10 text-foreground" />;
  if (!data) return (
    <div className="flex h-full w-full justify-center items-center text-muted-foreground text-sm">No profile data</div>
  );
  return <Profile data={data} />;
};

export default Page;

const Profile = ({ data }: { data: UserInfo }) => {
  const { data: marksData } = useMarks();
  const { data: attendanceData } = useAttendance();
  const { data: timetableData } = useTimetable();
  const { avatarId, customImage } = useAvatarStore();

  const stats = useMemo(() => {
    let obtained = 0, maxMark = 0, subjects = 0, totalAtt = 0;
    (marksData ?? []).forEach((s: MarkDetail) => {
      if (s.total?.obtained && s.total?.maxMark) { obtained += s.total.obtained; maxMark += s.total.maxMark; subjects++; }
    });
    (attendanceData ?? []).forEach((s: AttendanceDetail) => {
      totalAtt += parseFloat((s.courseAttendance ?? "0").replace('%', ''));
    });
    const uniqueCodes = new Set<string>();
    (timetableData ?? []).forEach((d: DaySchedule) => d.class?.forEach(c => c.courseCode && uniqueCodes.add(c.courseCode)));
    return {
      marksPct:   maxMark > 0 ? Math.round((obtained / maxMark) * 1000) / 10 : 0,
      marksRaw:   `${Math.round(obtained)}/${Math.round(maxMark)}`,
      attPct:     attendanceData?.length ? Math.round((totalAtt / attendanceData.length) * 10) / 10 : 0,
      subjects,
      coursesPerWeek: uniqueCodes.size,
    };
  }, [marksData, attendanceData, timetableData]);

  const renderAvatar = () => {
    if (avatarId === 999 && customImage) return <img src={customImage} alt="" className="w-full h-full object-cover" />;
    if (avatarId) { const a = presetAvatars.find(x => x.id === avatarId); if (a) return <div className="w-full h-full flex items-center justify-center p-2">{a.svg}</div>; }
    return <span className="text-4xl font-black text-foreground">{data.name.slice(0,2).toUpperCase()}</span>;
  };

  const attColor = stats.attPct >= 75 ? "#22c55e" : stats.attPct >= 60 ? "#eab308" : "#ef4444";
  const markColor = stats.marksPct >= 75 ? "#22c55e" : stats.marksPct >= 50 ? "#eab308" : "#ef4444";

  return (
    <div className="w-full h-full overflow-y-auto pb-16">

      {/* ── ID CARD ─────────────────────────────────────────── */}
      <div className="relative border-b border-border overflow-hidden">
        {/* Diagonal rule line top-right decoration */}
        <div className="absolute top-0 right-0 w-px h-full bg-border" />
        <div className="absolute top-0 right-12 w-px h-full bg-border opacity-40" />

        <div className="flex items-stretch gap-0">
          {/* Avatar column */}
          <div className="w-28 flex-shrink-0 border-r border-border flex items-center justify-center bg-accent/30"
            style={{ minHeight: 140 }}>
            <div className="w-16 h-16 border-2 border-foreground overflow-hidden flex items-center justify-center bg-background">
              {renderAvatar()}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 px-5 py-5 flex flex-col justify-between gap-3">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-1">Student ID</p>
              <p className="text-xl font-black text-foreground leading-tight uppercase">{data.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-1 tracking-wider">{data.regNumber}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Batch</p>
                <p className="text-xs font-black text-foreground">{data.batch ?? "—"}</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Program</p>
                <p className="text-xs font-black text-foreground">B.Tech · CSE</p>
              </div>
              <div className="w-px h-6 bg-border" />
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Courses</p>
                <p className="text-xs font-black text-foreground">{stats.subjects > 0 ? stats.subjects : "—"}</p>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center px-3 border-l border-border gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 mb-1" />
            <p className="text-[8px] font-black uppercase tracking-widest text-green-500" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>ACTIVE</p>
          </div>
        </div>
      </div>

      {/* ── STATS GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 border-b border-border">
        {/* Attendance */}
        <div className="border-r border-border px-5 py-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ backgroundColor: attColor, opacity: 0.5 }} />
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Attendance</p>
          <p className="text-4xl font-black tabular-nums leading-none" style={{ color: attColor }}>
            {stats.attPct}<span className="text-lg">%</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            {stats.attPct >= 75 ? "Above threshold" : "Below 75% — at risk"}
          </p>
        </div>

        {/* Marks */}
        <div className="px-5 py-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 h-[3px] w-full" style={{ backgroundColor: markColor, opacity: 0.5 }} />
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Marks</p>
          <p className="text-4xl font-black tabular-nums leading-none" style={{ color: markColor }}>
            {stats.marksPct}<span className="text-lg">%</span>
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-2">{stats.marksRaw}</p>
        </div>
      </div>

      {/* ── PROGRESS BARS ─────────────────────────────────────── */}
      <div className="border-b border-border px-5 py-4 space-y-3">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-3">Performance</p>
        {[
          { label: "Attendance", pct: stats.attPct, color: attColor },
          { label: "Marks", pct: stats.marksPct, color: markColor },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-3">
            <p className="text-[10px] text-muted-foreground w-20 uppercase tracking-wide">{row.label}</p>
            <div className="flex-1 h-[3px] bg-border overflow-hidden">
              <div className="h-full transition-all duration-700" style={{ width: `${Math.min(row.pct, 100)}%`, backgroundColor: row.color }} />
            </div>
            <p className="text-[10px] font-black tabular-nums w-10 text-right" style={{ color: row.color }}>{row.pct}%</p>
          </div>
        ))}
      </div>

      {/* ── QUICK STATS ROW ───────────────────────────────────── */}
      <div className="grid grid-cols-3 border-b border-border">
        {[
          { label: "Subjects", value: stats.subjects || "—" },
          { label: "Per Week", value: stats.coursesPerWeek || "—" },
          { label: "Semester", value: "4th" },
        ].map((s, i) => (
          <div key={i} className={`px-4 py-4 text-center ${i < 2 ? "border-r border-border" : ""}`}>
            <p className="text-2xl font-black text-foreground tabular-nums">{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── TOOLS ─────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest px-5 pt-4 pb-2">Tools</p>
        <AbsencePredictorCard />
      </div>

      {/* ── SIGN OUT ──────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <Link href="/auth/logout">
          <button className="w-full flex items-center gap-3 border border-destructive/30 px-4 py-3 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </Link>
      </div>

      {/* ── BRANDING ──────────────────────────────────────────── */}
      <div className="pb-6 flex items-center justify-center gap-1.5">
        <span className="text-[9px] text-muted-foreground/30 tracking-widest uppercase">crafted by</span>
        <span className="text-[9px] font-black text-foreground/40 tracking-tight">gowthamrdyy</span>
      </div>

    </div>
  );
};

