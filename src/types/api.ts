// Types defined locally — no dependency on reddy-api-srm npm package

export interface PasswordInput {
  identifier: string;
  digest: string;
  password: string;
  email?: string;
}

export interface AttendanceStatusType {
  status: "required" | "margin";
  classes: number;
}

export interface AttendanceDetail {
  courseCode: string;
  courseTitle: string;
  courseCategory: string;
  courseFaculty: string;
  courseSlot: string;
  courseConducted: number;
  courseAbsent: number;
  courseAttendance: string;
  courseAttendanceStatus: AttendanceStatusType;
}

export interface CourseDetail {
  courseCode: string;
  courseTitle: string;
  courseCredit: string;
  courseCategory: string;
  courseType: string;
  courseFaculty: string;
  courseSlot: string[];
  courseRoomNo: string;
}

export interface Mark {
  exam: string;
  obtained: number;
  maxMark: number;
}

export interface MarkDetail {
  course: string;
  category: string;
  marks: Mark[];
  total: {
    obtained: number;
    maxMark: number;
  };
}

export interface UserInfo {
  regNumber: string;
  name: string;
  mobile: string;
  section: string;
  program: string;
  department: string;
  semester: string;
  batch: string;
}

export interface SlotInfo {
  courseTitle: string;
  courseCode: string;
  courseType: string;
  courseCategory: string;
  courseRoomNo: string;
}

export interface CourseSlot {
  slot: string;
  isClass: boolean;
  courseTitle?: string;
  courseCode?: string;
  courseType?: string;
  courseCategory?: string;
  courseRoomNo?: string;
  time: string;
}

export interface DaySchedule {
  dayOrder: string;
  class: CourseSlot[];
}

export interface Day {
  date: string;
  day: string;
  event: string;
  dayOrder: string;
}

// Backward compatibility alias
export type DayInfo = Day;

export interface Month {
  month: string;
  days: Day[];
}

export interface DayOrderResponse {
  dayOrder?: string;
  error?: string;
  status: number;
}

// Extended auth data to include concurrent session fields
export interface ExtendedAuthData {
  cookies?: string;
  statusCode: number;
  message?: string;
  captcha?: {
    required: boolean;
    digest: string | null | undefined;
  };
  isConcurrentLimit?: boolean;
  flowId?: string | null;
}