import { getProfile } from "./session.js";

export function isAdmin() {
  return getProfile()?.role === "admin";
}

export function isFaculty() {
  return getProfile()?.role === "faculty";
}
