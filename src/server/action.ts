"use server";

import {
  validateUser as _validateUser,
  validatePassword as _validatePassword,
  getLogout as _getLogout,
  timetable as _timetable,
  attendance as _attendance,
  marks as _marks,
  Calendar as _Calendar,
  Course as _Course,
  userInfo as _userInfo,
  dayOrder as _dayOrder,
  validateFriendUser as _validateFriendUser,
  validateFriendPassword as _validateFriendPassword,
  getFriendMarks as _getFriendMarks,
  getFriendLogout as _getFriendLogout,
  terminateSessions as _terminateSessions,
} from "@/lib/api-wrapper";

export async function validateUser(email: string) {
  return await _validateUser(email);
}

export async function validatePassword(params: { digest: string; identifier: string; password: string; email?: string }) {
  return await _validatePassword(params);
}

export async function getLogout(cookie: string) {
  return await _getLogout(cookie);
}

export async function timetable(cookie: string) {
  return await _timetable(cookie);
}

export async function attendance(cookie: string) {
  return await _attendance(cookie);
}

export async function marks(cookie: string) {
  return await _marks(cookie);
}

export async function Calendar(cookie: string) {
  return await _Calendar(cookie);
}

export async function Course(cookie: string) {
  return await _Course(cookie);
}

export async function userInfo(cookie: string) {
  return await _userInfo(cookie);
}

export async function dayOrder(cookie: string) {
  return await _dayOrder(cookie);
}

// Friend authentication and marks fetching
export async function validateFriendUser(email: string) {
  return await _validateFriendUser(email);
}

export async function validateFriendPassword(params: { digest: string; identifier: string; password: string }) {
  return await _validateFriendPassword(params);
}

export async function getFriendMarks(cookie: string) {
  return await _getFriendMarks(cookie);
}

export async function getFriendLogout(cookie: string) {
  return await _getFriendLogout(cookie);
}

export async function terminateSessions(params: { flowId: string | null; identifier: string; digest: string; csrfToken?: string }) {
  return await _terminateSessions(params);
}
