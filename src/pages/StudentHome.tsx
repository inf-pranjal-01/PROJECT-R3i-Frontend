import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Menu, Plus, ArrowRight, LogOut } from "lucide-react";
import DecoWaves from "../components/DecoWaves";
import ComplaintCard from "../components/ComplaintCard";
import StudentSidebar from "../components/StudentSidebar";

function getTimestampValue(value: any) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1_000_000);
  }
  if (value instanceof Date) return value.getTime();

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

interface StudentHomeProps {
  user: any;
  onOpenChat: (complaint: any) => void;
  onNewComplaint: () => void;
  onLogout: () => void;
}

const StudentHome = ({ user, onOpenChat, onNewComplaint, onLogout }: StudentHomeProps) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchId, setSearchId] = useState("");

  const firstName = user.displayName?.split(" ")[0]?.toUpperCase() || "USER";
  const hasActionRequired = complaints.some((c) => c.studentFlag === "red");

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("studentId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const nextComplaints = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort(
            (a: any, b: any) =>
              getTimestampValue(b.lastUpdated || b.createdAt) -
              getTimestampValue(a.lastUpdated || a.createdAt)
          );

        setComplaints(nextComplaints);
      },
      (error) => {
        console.error("[StudentHome] Complaint listener error:", error);
      }
    );

    return unsub;
  }, [user.uid]);

  const handleSearch = () => {
    if (!searchId.trim()) return;
    const found = complaints.find(
      (c) => c.trackingId?.toLowerCase() === searchId.trim().toLowerCase()
    );
    if (found) onOpenChat(found);
    else alert("No complaint found with that tracking ID.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-10 py-5 bg-background/95 backdrop-blur-sm z-50 border-b border-input">
        <button
          onClick={() => setSidebarOpen(true)}
          className="relative w-11 h-[38px] border-[2.5px] border-foreground rounded-lg bg-background flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        >
          <Menu size={18} />
          {hasActionRequired && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full status-red border-2 border-background animate-pulse-dot" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onNewComplaint}
            className="bg-foreground text-background border-none rounded-[50px] py-2.5 px-5 text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80 hover:-translate-y-0.5"
          >
            <Plus size={16} /> New Complaint
          </button>
          <button
            onClick={onLogout}
            className="border-2 border-foreground rounded-lg p-2 hover:bg-secondary transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="pt-24 px-10 relative z-10 ml-[160px] flex items-start gap-6">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full flex-shrink-0 object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0" />
        )}
        <div>
          <h2>
            <span className="font-accent text-[2.5rem] text-foreground">Wassup,</span>
            <br />
            <span className="font-display text-[3.5rem] text-foreground leading-none">
              {firstName}
            </span>
          </h2>
          <p className="text-muted-foreground mt-1">Got anything to say?</p>
        </div>
      </div>

      {/* Complaints grid */}
      <div className="px-10 py-8 relative z-10 ml-[160px] mr-[160px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              flagField="studentFlag"
              onClick={() => onOpenChat(c)}
            />
          ))}
        </div>
        {complaints.length === 0 && (
          <div className="text-center text-muted-foreground py-20 text-lg">
            No complaints yet. Click "New Complaint" to get started.
          </div>
        )}
      </div>

      {/* Tracking search bar */}
      <div className="fixed bottom-0 left-0 right-0 px-10 py-6 z-40 flex justify-center">
        <div className="bg-foreground rounded-[50px] flex items-center max-w-[700px] w-full px-6 py-3 shadow-2xl">
          <input
            type="text"
            placeholder="Write tracking id to search...."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent border-none outline-none text-background placeholder:text-background/50 text-base font-medium"
          />
          <button onClick={handleSearch} className="text-background ml-2">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <StudentSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        complaints={complaints}
        userName={firstName}
        onSelectComplaint={onOpenChat}
      />
    </div>
  );
};

export default StudentHome;
