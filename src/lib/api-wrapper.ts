// API wrapper — all calls go to the Go reddy-api backend via HTTP
// Transforms Go backend responses to match the shapes expected by query.ts
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type {
  PasswordInput,
  AttendanceDetail,
  MarkDetail,
  DaySchedule,
  UserInfo,
  CourseDetail,
  Month,
  CourseSlot,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function validateUser(email: string) {
  try {
    const res = await fetch(`${API_BASE}/verify-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email }),
    });
    const json = await res.json();
    return { res: json };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("validateUser error:", error);
    return { res: { error: true, errorReason: "Service unavailable" } };
  }
}

export async function validatePassword(params: PasswordInput) {
  try {
    const res = await fetch(`${API_BASE}/verify-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return { res: json };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("validatePassword error:", error);
    return { res: { error: true, errorReason: "Service unavailable" } };
  }
}

export async function terminateSessions(params: {
  flowId: string | null;
  identifier: string;
  digest: string;
  csrfToken?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/terminate-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return { res: json };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("terminateSessions error:", error);
    return { res: { success: false, error: "Service unavailable" } };
  }
}

export async function getLogout(cookie: string) {
  try {
    const res = await fetch(`${API_BASE}/logout`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": cookie },
    });
    const json = await res.json();
    return { res: json };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("getLogout error:", error);
    return { res: { error: true, errorReason: "Service unavailable" } };
  }
}

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function fetchFromAPI(endpoint: string, cookie: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": cookie },
    cache: "no-store",
  });
  if (!res.ok) {
    return { error: "Unauthorized", status: res.status };
  }
  const data = await res.json();
  return { ...data, status: res.status };
}

// ─── Timetable ───────────────────────────────────────────────────────────────
// Go returns: { regNumber, batch, schedule: [{day, table: [TableSlot]}] }
// Frontend expects: { timetable: DaySchedule[], status }
// DaySchedule = { dayOrder: string, class: CourseSlot[] }

function transformTimetable(raw: Record<string, unknown>): { timetable: DaySchedule[]; status: number } {
  const schedule = (raw.schedule as Array<{ day: number; dayOrder?: string; table: Array<Record<string, unknown> | null> }>) || [];
  const timetable: DaySchedule[] = schedule.map((dayEntry) => {
    const slots: CourseSlot[] = (dayEntry.table || []).map((slot, idx) => {
      if (!slot) return { slot: "", isClass: false, time: getTimeSlot(idx) };
      return {
        slot: (slot.slot as string) || "",
        isClass: true,
        courseTitle: (slot.name as string) || "",
        courseCode: (slot.code as string) || "",
        courseType: (slot.courseType as string) || "",
        courseCategory: "",
        courseRoomNo: (slot.roomNo as string) || "",
        time: getTimeSlot(idx),
      };
    });
    return {
      dayOrder: `Day ${dayEntry.day || dayEntry.dayOrder || ""}`,
      class: slots,
    };
  });
  return { timetable, status: (raw.status as number) || 200 };
}

// SRM KTR standard 10-slot timetable times
function getTimeSlot(idx: number): string {
  const times = [
    "8:00 AM - 8:50 AM",
    "9:00 AM - 9:50 AM",
    "10:00 AM - 10:50 AM",
    "11:00 AM - 11:50 AM",
    "12:00 PM - 12:50 PM",
    "1:00 PM - 1:50 PM",
    "2:00 PM - 2:50 PM",
    "3:00 PM - 3:50 PM",
    "4:00 PM - 4:50 PM",
    "5:00 PM - 5:50 PM",
  ];
  return times[idx] || `${8 + idx}:00 AM - ${8 + idx}:50 AM`;
}

export async function timetable(cookie: string) {
  try {
    const raw = await fetchFromAPI("/timetable", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    const data = transformTimetable(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("timetable error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Attendance ───────────────────────────────────────────────────────────────
// Go returns: { regNumber, attendance: [{courseCode, courseTitle, category, facultyName, slot, hoursConducted, hoursAbsent, attendancePercentage}] }
// Frontend expects: { attendance: AttendanceDetail[], status }
// AttendanceDetail = { courseCode, courseTitle, courseCategory, courseFaculty, courseSlot, courseConducted, courseAbsent, courseAttendance, courseAttendanceStatus }

function transformAttendance(raw: Record<string, unknown>): { attendance: AttendanceDetail[]; status: number } {
  const list = (raw.attendance as Array<Record<string, string>>) || [];
  const attendance: AttendanceDetail[] = list.map((item) => {
    const conducted = parseInt(item.hoursConducted || "0", 10);
    const absent = parseInt(item.hoursAbsent || "0", 10);
    const attended = conducted - absent;
    const pct = conducted > 0 ? (attended / conducted) * 100 : 0;
    const needed = Math.max(0, Math.ceil((0.75 * conducted - attended) / 0.25));
    return {
      courseCode: item.courseCode || "",
      courseTitle: item.courseTitle || "",
      courseCategory: item.category || "",
      courseFaculty: item.facultyName || "",
      courseSlot: item.slot || "",
      courseConducted: conducted,
      courseAbsent: absent,
      courseAttendance: item.attendancePercentage || `${pct.toFixed(2)}%`,
      courseAttendanceStatus: {
        status: pct >= 75 ? "margin" : "required",
        classes: needed,
      },
    };
  });
  return { attendance, status: (raw.status as number) || 200 };
}

export async function attendance(cookie: string) {
  try {
    const raw = await fetchFromAPI("/attendance", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    const data = transformAttendance(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("attendance error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Marks ────────────────────────────────────────────────────────────────────
// Go returns: { regNumber, marks: [{courseName, courseCode, courseType, overall:{scored,total}, testPerformance:[{test, marks:{scored,total}}]}] }
// Frontend expects: { markList: MarkDetail[], status }
// MarkDetail = { course, category, marks: [{exam, obtained, maxMark}], total:{obtained, maxMark} }

function transformMarks(raw: Record<string, unknown>): { markList: MarkDetail[]; status: number } {
  const list = (raw.marks as Array<Record<string, unknown>>) || [];
  const markList: MarkDetail[] = list.map((item) => {
    const tp = (item.testPerformance as Array<{ test: string; marks: { scored: string; total: string } }>) || [];
    const overall = item.overall as { scored: string; total: string } || { scored: "0", total: "0" };
    return {
      course: (item.courseName as string) || (item.courseCode as string) || "",
      category: (item.courseType as string) || "",
      marks: tp.map((t) => ({
        exam: t.test || "",
        obtained: parseFloat(t.marks?.scored || "0"),
        maxMark: parseFloat(t.marks?.total || "0"),
      })),
      total: {
        obtained: parseFloat(overall.scored || "0"),
        maxMark: parseFloat(overall.total || "0"),
      },
    };
  });
  return { markList, status: (raw.status as number) || 200 };
}

export async function marks(cookie: string) {
  try {
    const raw = await fetchFromAPI("/marks", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    const data = transformMarks(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("marks error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
// Go returns: { calendar: [{month, days:[{date,day,event,dayOrder}]}], today, tomorrow, ... }
// Frontend expects: { calendar: Month[], status }  ← shape matches!

export async function Calendar(cookie: string) {
  try {
    const raw = await fetchFromAPI("/calendar", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    // Go's error field is a bool, convert it
    if (raw.error === true) return { data: { error: "Calendar error", status: 500 } };
    return { data: raw };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Calendar error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Day Order ────────────────────────────────────────────────────────────────
// Derived from calendar today's dayOrder

export async function dayOrder(cookie: string) {
  try {
    const raw = await fetchFromAPI("/calendar", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    // today is { date, day, event, dayOrder }
    const todayDayOrder = raw.today?.dayOrder || raw.today?.day || null;
    return { data: { dayOrder: todayDayOrder, status: 200 } };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("dayOrder error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Courses ──────────────────────────────────────────────────────────────────
// Go returns: { regNumber, courses: [{code, title, credit, category, courseCategory, type, slotType, faculty, slot, room, academicYear}] }
// Frontend expects: { courseList: CourseDetail[], status }
// CourseDetail = { courseCode, courseTitle, courseCredit, courseCategory, courseType, courseFaculty, courseSlot:[], courseRoomNo }

function transformCourses(raw: Record<string, unknown>): { courseList: CourseDetail[]; status: number } {
  const list = (raw.courses as Array<Record<string, string>>) || [];
  const courseList: CourseDetail[] = list.map((item) => ({
    courseCode: item.code || "",
    courseTitle: item.title || "",
    courseCredit: item.credit || "",
    courseCategory: item.courseCategory || item.category || "",
    courseType: item.type || item.slotType || "",
    courseFaculty: item.faculty || "",
    courseSlot: item.slot ? item.slot.split("+").map((s) => s.trim()) : [],
    courseRoomNo: item.room || "",
  }));
  return { courseList, status: (raw.status as number) || 200 };
}

export async function Course(cookie: string) {
  try {
    const raw = await fetchFromAPI("/courses", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    const data = transformCourses(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Course error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── User Info ────────────────────────────────────────────────────────────────
// Go returns flat: { name, mobile, program, semester, regNumber, batch, year, department, section, specialization }
// Frontend expects: { userInfo: UserInfo, status }
// UserInfo = { regNumber, name, mobile, section, program, department, semester, batch }

function transformUser(raw: Record<string, unknown>): { userInfo: UserInfo; status: number } {
  const userInfo: UserInfo = {
    regNumber: (raw.regNumber as string) || "",
    name: (raw.name as string) || "",
    mobile: (raw.mobile as string) || "",
    section: (raw.section as string) || "",
    program: (raw.program as string) || "",
    department: (raw.department as string) || "",
    semester: String(raw.semester || ""),
    batch: (raw.batch as string) || "",
  };
  return { userInfo, status: (raw.status as number) || 200 };
}

export async function userInfo(cookie: string) {
  try {
    const raw = await fetchFromAPI("/user", cookie);
    if (raw.status === 401) redirect("/auth/logout");
    const data = transformUser(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("userInfo error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

// ─── Friend features (reuse same endpoints) ────────────────────────────────

export async function validateFriendUser(email: string) {
  return await validateUser(email);
}

export async function validateFriendPassword(params: PasswordInput) {
  return await validatePassword(params);
}

export async function getFriendMarks(cookie: string) {
  try {
    const raw = await fetchFromAPI("/marks", cookie);
    if (raw.status === 404) return { data: { error: "Authentication failed", status: 404 } };
    const data = transformMarks(raw);
    return { data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("getFriendMarks error:", error);
    return { data: { error: "Service unavailable", status: 500 } };
  }
}

export async function getFriendLogout(cookie: string) {
  return await getLogout(cookie);
}
