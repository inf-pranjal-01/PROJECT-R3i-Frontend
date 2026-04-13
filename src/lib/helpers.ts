import { Timestamp } from "firebase/firestore";

export function timeAgo(ts: any): string {
  if (!ts) return "";
  let then: number;
  if (ts instanceof Timestamp) {
    then = ts.toDate().getTime();
  } else if (typeof ts === "number") {
    then = ts;
  } else {
    then = Date.now();
  }
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "JUST NOW";
  if (diff < 3600) return `${Math.floor(diff / 60)} MINS AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} HOURS AGO`;
  return `${Math.floor(diff / 86400)} DAYS AGO`;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted: "SUBMITTED",
    admin_responded: "ACTION REQUIRED",
    student_replied: "RESPONDED",
    resolved: "RESOLVED",
  };
  return map[status] || (status ? status.toUpperCase() : "SUBMITTED");
}

export function flagColorClass(flag: string): string {
  if (flag === "red") return "status-red";
  if (flag === "yellow") return "status-yellow";
  if (flag === "green") return "status-green";
  return "bg-muted";
}
