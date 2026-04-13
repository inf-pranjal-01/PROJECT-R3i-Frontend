import { useState } from "react";
import { flagColorClass } from "../lib/helpers";

interface StudentSidebarProps {
  open: boolean;
  onClose: () => void;
  complaints: any[];
  userName: string;
  onSelectComplaint: (complaint: any) => void;
}

const StudentSidebar = ({
  open,
  onClose,
  complaints,
  userName,
  onSelectComplaint,
}: StudentSidebarProps) => {
  const [search, setSearch] = useState("");

  const filtered = complaints.filter(
    (c) =>
      c.shortTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.trackingId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/30 z-[60]" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[320px] bg-background border-r-[2.5px] border-foreground z-[70] transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User */}
        <div className="flex items-center gap-4 p-6 border-b border-input">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <span className="font-display text-2xl">{userName}</span>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="grad-pill">
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-2.5 px-4 w-full text-sm font-medium text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                onSelectComplaint(c);
                onClose();
              }}
              className="border-b border-input py-3 cursor-pointer hover:bg-secondary rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{c.trackingId}</span>
                <span>{c.lastUpdated ? "updated" : ""}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="border border-foreground rounded-lg px-3 py-1 text-xs font-semibold">
                  {c.shortTitle?.toUpperCase() || "COMPLAINT"}
                </span>
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${flagColorClass(
                    c.studentFlag
                  )}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
