"use client";
import React, { useState } from "react";
import { useCourse } from "@/hooks/query";
import { CourseDetail } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { BookOpen, User, MapPin, Hash, Layers, Tag } from "lucide-react";

const categoryColor: Record<string, string> = {
  "professional core":    "text-blue-500  border-blue-500/30  bg-blue-500/5",
  "professional elective":"text-purple-500 border-purple-500/30 bg-purple-500/5",
  "open elective":        "text-orange-500 border-orange-500/30 bg-orange-500/5",
  "foundation":           "text-green-500  border-green-500/30  bg-green-500/5",
};

const getCategoryStyle = (cat: string) =>
  categoryColor[cat.toLowerCase()] ?? "text-muted-foreground border-border bg-background";

const Page = () => {
  const { data: courses, isPending } = useCourse();
  const [search, setSearch] = useState("");

  if (isPending) return <GlobalLoader className="h-10 w-10 text-foreground" />;
  if (!courses || courses.length === 0)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <BookOpen className="w-8 h-8 opacity-30" />
        <p className="text-sm">No course data found</p>
      </div>
    );

  const filtered = courses.filter((c: CourseDetail) =>
    c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    c.courseFaculty.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = courses.reduce((s: number, c: CourseDetail) => s + (parseInt(c.courseCredit) || 0), 0);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-end justify-between pb-4 border-b border-border">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Enrolled Courses</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-foreground tabular-nums leading-none">{courses.length}</span>
            <span className="text-sm text-muted-foreground font-medium">subjects</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            <span className="text-foreground font-bold">{totalCredits}</span> total credits
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex-shrink-0 py-3 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by course, code or faculty…"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 border border-border px-3 py-2 focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* ── Course list ── */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No courses match your search</p>
        )}
        {filtered.map((course: CourseDetail, i: number) => (
          <div key={i} className="border border-border bg-card hover:bg-accent/30 transition-colors">

            {/* Top: title + credit badge */}
            <div className="flex items-start justify-between px-4 pt-3 pb-2 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-snug">{course.courseTitle}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{course.courseCode}</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center border border-border px-2.5 py-1.5 min-w-[44px]">
                <span className="text-base font-black text-foreground leading-none">{course.courseCredit}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">credits</span>
              </div>
            </div>

            {/* Meta row */}
            <div className="px-4 pb-3 flex flex-col gap-1.5">

              {/* Faculty */}
              <div className="flex items-center gap-2 border border-border px-3 py-1.5 bg-background">
                <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-[11px] text-foreground font-medium truncate">{course.courseFaculty || "—"}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Room */}
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 bg-background">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-foreground font-medium truncate">{course.courseRoomNo || "—"}</span>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 bg-background">
                  <Layers className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-foreground font-medium truncate">{course.courseType || "—"}</span>
                </div>
              </div>

              {/* Slots + Category */}
              <div className="flex items-center gap-2 flex-wrap">
                {course.courseSlot.map((slot, si) => (
                  <span key={si} className="text-[10px] font-bold border border-border px-2 py-0.5 text-muted-foreground font-mono">
                    {slot}
                  </span>
                ))}
                {course.courseCategory && (
                  <span className={`text-[10px] font-bold border px-2 py-0.5 capitalize ${getCategoryStyle(course.courseCategory)}`}>
                    {course.courseCategory}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
