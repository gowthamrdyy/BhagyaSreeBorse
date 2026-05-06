"use client";
import { useUserInfo, useDayOrder, useTimetable, useAttendance } from "@/hooks/query";
import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Minus,
  Plus,
  CalendarCheck
} from "lucide-react";
import { DaySchedule } from "@/types/api";
import { GlobalLoader } from "../components/loader";
import { isCurrentClass } from "@/utils/currentClass";
import DownloadButton from "@/components/ui/button-download";

const Page = () => {
  const { data, isPending } = useTimetable();
  const { data: userInfo } = useUserInfo();

  if (isPending) return <GlobalLoader className="h-10 w-10 text-foreground" />;
  if (!data || data.length === 0)
    return (
      <div className="flex h-full w-full justify-center items-center text-muted-foreground font-medium">
        No timetable data found
      </div>
    );
  return <DayChange data={data} userName={userInfo?.name || "Student"} />;
};

export default Page;

const DayChange = ({ data, userName }: { data: DaySchedule[]; userName: string }) => {
  const day = data?.map((i) => (i.dayOrder || "").split(" ")[1] || "?");
  const [today, setToday] = useState<number>();
  const [dayOrder, setDayOrder] = useState<number>(0);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading" | "downloaded" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const timetableRef = useRef<HTMLDivElement>(null);
  const {
    data: dayOrderData,
  } = useDayOrder();

  React.useEffect(() => {
    if (dayOrderData) {
      const todayDayOrder = Number(dayOrderData.dayOrder);
      if (!isNaN(todayDayOrder) && todayDayOrder > 0) {
        setToday(todayDayOrder);
        setDayOrder(todayDayOrder - 1);
        return;
      }
      setToday(0);
      setDayOrder(0);
    }
  }, [dayOrderData]);

  const downloadTimetable = async () => {
    setDownloadStatus("downloading");
    setProgress(0);

    try {
      // 1. Start Image Generation (in background)
      const generationPromise = (async () => {
        // Get all unique time slots
        const timeSlots = new Set<string>();
        data.forEach(dayData => {
          (dayData.class || []).forEach(classItem => {
            if (classItem.time) timeSlots.add(classItem.time);
          });
        });

        // Sort time slots properly (8:00 first)
        const sortedTimeSlots = Array.from(timeSlots).sort((a, b) => {
          const getMinutes = (time: string) => {
            const [start] = time.split('-');
            const [hours, mins] = start.split(':').map(Number);
            return hours * 60 + mins;
          };
          return getMinutes(a) - getMinutes(b);
        });

        // Assign a pastel colour per unique course title
        const courseColors = ['#d1fae5','#dbeafe','#fef9c3','#fce7f3','#ede9fe','#ffedd5','#ccfbf1','#e0f2fe'];
        const courseColorMap: Record<string,string> = {};
        let colorIdx = 0;
        data.forEach(dayData => {
          (dayData.class || []).forEach(c => {
            const key = c.courseTitle || c.courseCode || '';
            if (key && !courseColorMap[key]) {
              courseColorMap[key] = courseColors[colorIdx % courseColors.length];
              colorIdx++;
            }
          });
        });

        // Canvas: 1920×1080 landscape grid
        const W = 1920, H = 1080;
        const container = document.createElement('div');
        container.style.cssText = `position:absolute;left:-9999px;top:0;width:${W}px;height:${H}px;background:#f8f8f8;font-family:ui-sans-serif,system-ui,sans-serif;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;`;
        document.body.appendChild(container);

        // ── HEADER ROW
        const headerArea = document.createElement('div');
        headerArea.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:28px 48px 20px;flex-shrink:0;';
        headerArea.innerHTML = `
          <div>
            <div style="font-size:32px;font-weight:900;letter-spacing:-1px;color:#111;">BhagyaSreeBorse</div>
            <div style="font-size:14px;color:#555;margin-top:4px;">Class Schedule</div>
          </div>
          <div style="font-size:14px;font-weight:700;color:#111;letter-spacing:0.03em;">${userName}</div>
        `;
        container.appendChild(headerArea);

        // ── BUILD TABLE
        const tableWrap = document.createElement('div');
        tableWrap.style.cssText = 'flex:1;padding:0 48px 32px;min-height:0;overflow:hidden;';

        const table = document.createElement('table');
        table.style.cssText = 'width:100%;height:100%;border-collapse:collapse;table-layout:fixed;';

        // thead
        const thead = document.createElement('thead');
        const theadRow = document.createElement('tr');

        // "Time" cell
        const thTime = document.createElement('th');
        thTime.style.cssText = 'background:#1a1a1a;color:#fff;font-size:13px;font-weight:700;text-align:center;padding:10px 6px;border:1px solid #333;width:90px;';
        thTime.textContent = 'Time';
        theadRow.appendChild(thTime);

        sortedTimeSlots.forEach((slot, si) => {
          const th = document.createElement('th');
          th.style.cssText = 'background:#1a1a1a;color:#fff;font-size:11px;font-weight:700;text-align:center;padding:8px 4px;border:1px solid #333;line-height:1.4;';
          const [start, end] = slot.split('-');
          th.innerHTML = `<div style="font-size:12px;font-weight:800;">Slot ${si+1}</div><div style="font-size:10px;color:#aaa;margin-top:2px;">${(start||'').trim()} - ${(end||'').trim()}</div>`;
          theadRow.appendChild(th);
        });
        thead.appendChild(theadRow);
        table.appendChild(thead);

        // tbody
        const tbody = document.createElement('tbody');
        data.forEach((dayData, di) => {
          const tr = document.createElement('tr');

          // Day label cell
          const tdDay = document.createElement('td');
          tdDay.style.cssText = 'background:#faed27;color:#111;font-size:14px;font-weight:900;text-align:center;border:2px solid #111;vertical-align:middle;padding:8px 4px;';
          tdDay.innerHTML = `<div>Day ${dayData.dayOrder.split(' ')[1] || di+1}</div>`;
          tr.appendChild(tdDay);

          sortedTimeSlots.forEach(slot => {
            const classItem = (dayData.class || []).find(c => c.time === slot && c.isClass);
            const td = document.createElement('td');
            td.style.cssText = `border:1px solid #ccc;vertical-align:top;padding:8px 10px;`;
            if (classItem) {
              const bg = courseColorMap[classItem.courseTitle || classItem.courseCode || ''] || '#f0f0f0';
              td.style.background = bg;
              td.innerHTML = `
                <div style="font-size:12px;font-weight:700;color:#111;line-height:1.4;margin-bottom:6px;">${classItem.courseTitle || classItem.courseCode}</div>
                <div style="font-size:11px;color:#555;">${classItem.courseRoomNo || ''}</div>
              `;
            } else {
              td.style.background = '#fff';
            }
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        container.appendChild(tableWrap);

        const domtoimage = (await import('dom-to-image-more')).default;
        const blob = await domtoimage.toBlob(container, {
          bgcolor: '#f8f8f8', quality: 1, width: W, height: H,
        });
        document.body.removeChild(container);
        return blob;


      })();

      // 2. Run Smooth Progress Animation (At least 2-3 seconds)
      await new Promise<void>((resolve) => {
        let p = 0;
        const interval = setInterval(() => {
          p += 2; // Slower increment
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 30); // 30ms * 50 steps = ~1.5 seconds. Adjust as needed. 
        // Let's make it 50ms * 50 = 2.5 seconds for a satisfying "scan"
      });

      // 3. Wait for actual generation (it likely finishes before animation, but just in case)
      const blob = await generationPromise;

      // 4. Download
      setDownloadStatus("downloaded");
      const link = document.createElement('a');
      link.download = `timetable-nebula-${new Date().toISOString().split('T')[0]}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);

      // 5. Reset State
      setTimeout(() => {
        setDownloadStatus("complete");
      }, 1500);

      setTimeout(() => {
        setDownloadStatus("idle");
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Error downloading timetable:', error);
      alert(`Failed to download timetable. Please try again.`);
      setDownloadStatus("idle");
      setProgress(0);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="w-full flex-shrink-0 px-4 py-3 border-b border-border bg-background z-20 sticky top-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Timetable</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Day Selector */}
            <div className="flex items-center gap-0 bg-secondary border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setDayOrder(dayOrder > 0 ? dayOrder - 1 : day.length - 1)}
                className="px-2 py-1.5 hover:bg-accent transition-colors border-r border-border"
              >
                <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="px-4 text-xs font-bold text-foreground tabular-nums min-w-[64px] text-center">
                Day {day[dayOrder]}
              </span>
              <button
                onClick={() => setDayOrder(dayOrder < day.length - 1 ? dayOrder + 1 : 0)}
                className="px-2 py-1.5 hover:bg-accent transition-colors border-l border-border"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Download Button */}
            <DownloadButton
               downloadStatus={downloadStatus}
               progress={progress}
               onClick={downloadTimetable}
               className="border border-border bg-secondary text-foreground hover:bg-accent"
            />
          </div>
        </div>
      </div>

      {/* Content Area — fills height, no scroll */}
      <div className="flex-1 overflow-hidden p-3">
        <div ref={timetableRef} className="h-full">
          <Data data={data} dayorder={dayOrder} today={today} />
        </div>
      </div>
    </div>
  );
};

const Data = ({
  data,
  dayorder,
  today,
}: {
  data: DaySchedule[];
  dayorder: number;
  today: number | undefined;
}) => {
  const { data: attendanceData } = useAttendance();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [today, dayorder]);

  const currentDay = data?.[dayorder];
  if (!currentDay || !currentDay.class) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        No schedule data for this day
      </div>
    );
  }

  const allTimeSlots = currentDay.class;

  // Parse "HH:MM" with period → minutes since midnight
  const toMin = (t: string, period?: string): number => {
    const [hStr, mStr] = t.trim().split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || "0", 10);
    if (period) {
      const p = period.trim().toUpperCase();
      if (p === "PM" && h !== 12) h += 12;
      if (p === "AM" && h === 12) h = 0;
    }
    return h * 60 + m;
  };

  const parseRange = (time: string): { start: number; end: number } | null => {
    if (!time) return null;
    const match = time.match(
      /(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i
    );
    if (!match) return null;
    const startPeriod = match[2]?.toUpperCase();
    const endPeriod   = match[4]?.toUpperCase() ?? startPeriod;
    return {
      start: toMin(match[1], startPeriod),
      end:   toMin(match[3], endPeriod),
    };
  };

  // Build ordered list (skip empty slots without isClass, keep them as gaps)
  const slots = allTimeSlots
    .map((item) => ({ item, range: parseRange(item.time ?? "") }))
    .filter((s) => s.range !== null) as { item: typeof allTimeSlots[0]; range: { start: number; end: number } }[];

  // Sort by start time
  slots.sort((a, b) => a.range.start - b.range.start);


  return (
    <div className="h-full flex flex-col border border-border rounded-lg overflow-hidden divide-y divide-border/40">
      {slots.map(({ item, range }, index) => {
        const attendance = attendanceData?.find(
          (i) =>
            i.courseCode === item.courseCode &&
            ((item.slot.startsWith("P") && i.courseSlot === "LAB") ||
              !item.slot.startsWith("P"))
        );

        const current =
          today && today !== 0 && dayorder === today - 1 && item.time
            ? isCurrentClass(item.time)
            : undefined;

        const attendancePct = attendance ? Number(attendance.courseAttendance) : null;
        const marginStatus  = attendance?.courseAttendanceStatus;
        const isSafe        = marginStatus?.status !== "required";

        return (
          <div
            key={`${item.courseCode}-${item.slot}-${index}`}
            ref={current ? currentRef : undefined}
            className={`relative flex-1 min-h-0 flex items-center transition-colors ${
              item.isClass
                ? current
                  ? "bg-foreground/[0.11]"
                  : "bg-foreground/[0.04] hover:bg-foreground/[0.08]"
                : "bg-transparent"
            }`}
          >
            {/* Live accent bar */}
            {current && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />
            )}

            {item.isClass ? (
              <div className="flex flex-col justify-center w-full px-3 py-1 gap-0.5 min-w-0 overflow-hidden">

                {/* Row 1: Subject name + margin badge */}
                <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden">
                  {current && (
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  )}
                  <span className="flex-1 text-[11px] font-semibold text-foreground leading-tight truncate block" style={{ minWidth: 0 }}>
                    {item.courseTitle}
                  </span>
                  {marginStatus && (
                    <span className={`flex-shrink-0 text-[9px] font-black tabular-nums px-1.5 py-0.5 rounded leading-none border ${
                      isSafe
                        ? "bg-green-500/15 text-green-400 border-green-500/30"
                        : "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}>
                      {isSafe ? "+" : "−"}{marginStatus.classes}
                    </span>
                  )}
                </div>

                {/* Row 2: Time + attendance box */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-mono text-muted-foreground/50 whitespace-nowrap">
                    {item.time}
                  </span>
                  {attendancePct !== null && (
                    <span className="flex-shrink-0 text-[9px] font-bold tabular-nums px-1 py-px border border-border text-muted-foreground/70 leading-none whitespace-nowrap">
                      {attendance?.courseAttendance}%
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center w-full px-3 gap-3">
                <span className="flex-1 text-[9px] text-muted-foreground/20 italic">—</span>
                <span className="flex-shrink-0 text-[9px] font-mono text-muted-foreground/20 whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
