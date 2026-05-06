"use client";
import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calculator, X } from "lucide-react";
import { MarkDetail, CourseDetail } from "@/types/api";
import { cn } from "@/lib/utils";

interface SGPAPredictorProps {
  marksData: MarkDetail[];
  courseData: CourseDetail[];
  triggerClassName?: string;
  triggerContainerClassName?: string;
}

// SRM Grade system
const GRADES = [
  { name: "O",  points: 10, threshold: 90 },
  { name: "A+", points: 9,  threshold: 80 },
  { name: "A",  points: 8,  threshold: 70 },
  { name: "B+", points: 7,  threshold: 60 },
  { name: "B",  points: 6,  threshold: 55 },
  { name: "C",  points: 5,  threshold: 50 },
];

/**
 * SRM marking scheme:
 *   Internal:  raw marks out of 60 → direct 60  (used as-is)
 *   External:  raw marks out of 75 → scaled to 40  → (obtained / 75) * 40
 *   Total out of 100
 *
 * To reach threshold T:
 *   internal_obtained + (external / 75) * 40 >= T
 *   external >= (T - internal_obtained) * 75 / 40
 */
const calcRequired = (internalObtained: number, threshold: number): { required: number; isPossible: boolean } => {
  const neededFromExternal = threshold - internalObtained;
  const requiredOutOf75 = (neededFromExternal / 40) * 75;
  const isPossible = requiredOutOf75 >= 0 && requiredOutOf75 <= 75;
  return {
    required: Math.max(0, Math.min(75, Math.ceil(requiredOutOf75))),
    isPossible,
  };
};

export const SGPAPredictor: React.FC<SGPAPredictorProps> = ({
  marksData,
  courseData,
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<Record<string, number>>({});

  const subjects = useMemo(() => {
    return marksData
      .filter((m) => m.category.toLowerCase() === "theory")
      .map((m) => {
        const course   = courseData.find((c) => c.courseCode === m.course);
        const credits  = parseInt(course?.courseCredit ?? "0") || 0;
        const isProject = m.course.trim().toUpperCase().endsWith("P");
        return {
          courseCode:  m.course,
          courseTitle: course?.courseTitle || m.course,
          credits,
          internalObtained: m.total.obtained,
          internalMax:      m.total.maxMark,
          isProject,
        };
      });
  }, [marksData, courseData]);

  const rows = useMemo(() => {
    return subjects.map((s) => {
      const gradeIdx   = selectedGrades[s.courseCode] ?? 2; // default A
      const grade      = GRADES[gradeIdx];

      if (s.isProject) {
        // Project: 100% internal — just show projected grade based on current marks
        const pct        = s.internalMax > 0 ? (s.internalObtained / s.internalMax) * 100 : 0;
        const projGrade  = GRADES.find((g) => pct >= g.threshold) ?? GRADES[GRADES.length - 1];
        return { ...s, gradeIdx, grade, isProject: true, required: 0, isPossible: true, projGrade };
      }

      const { required, isPossible } = calcRequired(s.internalObtained, grade.threshold);
      return { ...s, gradeIdx, grade, required, isPossible, projGrade: null };
    });
  }, [subjects, selectedGrades]);

  const predictedSGPA = useMemo(() => {
    const withCredits = rows.filter((r) => r.credits > 0);
    if (!withCredits.length) return null;
    const totalCredits   = withCredits.reduce((s, r) => s + r.credits, 0);
    const weightedPoints = withCredits.reduce((s, r) => {
      const pts = r.isProject ? (r.projGrade?.points ?? 0) : r.grade.points;
      return s + pts * r.credits;
    }, 0);
    return totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : null;
  }, [rows]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 border border-border bg-background text-foreground text-xs hover:bg-accent transition-colors",
          triggerClassName
        )}
      >
        <Calculator className="w-3 h-3" />
        Grade Planner
      </button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[88vh] bg-background border border-border flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div>
            <p className="text-sm font-bold text-foreground">Grade Planner</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Select target grade → see required final exam marks</p>
          </div>
          <div className="flex items-center gap-4">
            {predictedSGPA && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">If achieved</p>
                <p className="text-2xl font-black tabular-nums text-foreground leading-none">{predictedSGPA}</p>
                <p className="text-[9px] text-muted-foreground">SGPA</p>
              </div>
            )}
            <button onClick={() => setOpen(false)} className="p-1.5 border border-border hover:bg-accent transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="flex-shrink-0 px-5 py-2 bg-accent/50 border-b border-border">
          <p className="text-[10px] text-muted-foreground">
            ⚠ SRM uses <span className="text-foreground font-semibold">relative grading</span> — final grade may vary. This shows the <span className="text-foreground font-semibold">minimum marks needed</span> in the external exam (out of 75) to hit each grade threshold. Internal marks (out of 60) are counted directly.
          </p>
        </div>

        {/* Subject list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rows.map((row) => (
            <div key={row.courseCode} className="border border-border px-5 py-4 space-y-3">

              {/* Subject info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    {row.courseCode} · {row.credits} cr
                    {row.isProject && <span className="ml-2 text-foreground font-bold">PROJECT</span>}
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{row.courseTitle}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] text-muted-foreground">Internal</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {row.internalObtained}<span className="text-muted-foreground font-normal text-[10px]">/{row.internalMax}</span>
                  </p>
                </div>
              </div>

              {row.isProject ? (
                /* Project subject — fully internal */
                <div className="flex items-center justify-between border border-border px-3 py-2 bg-accent/30">
                  <p className="text-[11px] text-muted-foreground">100% Internal assessment · No final exam</p>
                  <p className="text-xs font-bold text-foreground">
                    Projected: <span className="text-foreground">{row.projGrade?.name ?? "—"}</span>
                  </p>
                </div>
              ) : (
                <>
                  {/* Grade selector pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {GRADES.map((g, idx) => {
                      const { required, isPossible } = calcRequired(row.internalObtained, g.threshold);
                      return (
                        <button
                          key={g.name}
                          onClick={() => setSelectedGrades((prev) => ({ ...prev, [row.courseCode]: idx }))}
                          className={cn(
                            "flex flex-col items-center px-3 py-2 border text-center transition-colors min-w-[52px]",
                            idx === row.gradeIdx
                              ? "border-foreground bg-foreground/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                          )}
                        >
                          <span className="text-xs font-black">{g.name}</span>
                          <span className={cn("text-[9px] mt-0.5 tabular-nums font-semibold", isPossible ? "text-muted-foreground" : "text-red-500")}>
                            {isPossible ? `${required}/75` : "✗"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected grade detail */}
                  <div className="flex items-center justify-between border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      For <span className="text-foreground font-bold">{row.grade.name}</span> — need{" "}
                      <span className={cn("font-bold", row.isPossible ? "text-foreground" : "text-red-500")}>
                        {row.required}/75
                      </span>{" "}
                      in external exam
                    </p>
                    <span className={cn("text-[11px] font-bold", row.isPossible ? "text-green-500" : "text-red-500")}>
                      {row.isPossible ? "✓ achievable" : "✗ not possible"}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-2.5 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            Internal (out of 60) → direct · External (out of 75) → scaled to 40 · Total = 100
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
