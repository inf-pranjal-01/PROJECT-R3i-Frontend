import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowRight, LogOut } from "lucide-react";
import DecoWaves from "../components/DecoWaves";
import ComplaintCard from "../components/ComplaintCard";
import AdminComplaintDetail from "../components/AdminComplaintDetail";

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

interface AdminDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

const AdminDashboard = ({ user, profile, onLogout }: AdminDashboardProps) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});

  const firstName = user.displayName?.split(" ")[0]?.toUpperCase() || "ADMIN";
  const category = profile?.category || "";

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("assignedAdminId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const nextComplaints = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Record<string, any>) }))
          .sort(
            (a: any, b: any) =>
              getTimestampValue(b.lastUpdated || b.createdAt) -
              getTimestampValue(a.lastUpdated || a.createdAt)
          );

        setComplaints(nextComplaints);
      },
      (error) => {
        console.error("[AdminDashboard] Complaint listener error:", error);
      }
    );

    return unsub;
  }, [user.uid]);

  // Fetch last student enhanced message for each complaint
  useEffect(() => {
    if (complaints.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    complaints.forEach((c) => {
      const messagesRef = collection(db, "complaints", c.id, "messages");
      const unsub = onSnapshot(messagesRef, (snap) => {
        const studentMsgs = snap.docs
          .map((d) => d.data())
          .filter((m) => m.type === "student")
          .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt));
        if (studentMsgs.length > 0) {
          const msg = studentMsgs[0];
          const text = msg.enhanced || msg.raw || msg.content || "";
          setLastMessages((prev) => ({ ...prev, [c.id]: text }));
        }
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [complaints]);

  useEffect(() => {
    if (!selectedComplaint) return;

    const updatedComplaint = complaints.find((complaint) => complaint.id === selectedComplaint.id);
    if (updatedComplaint) {
      setSelectedComplaint(updatedComplaint);
    }
  }, [complaints, selectedComplaint]);

  const handleSearch = () => {
    if (!searchId.trim()) return;
    const found = complaints.find(
      (c) => c.trackingId?.toLowerCase() === searchId.trim().toLowerCase()
    );
    if (found) setSelectedComplaint(found);
    else alert("No complaint found with that tracking ID.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      {/* Header */}
      <div className="pt-8 px-10 relative z-10 ml-[160px] flex items-start gap-6">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full flex-shrink-0 object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0" />
        )}
        <div>
          <p className="font-accent text-xl text-foreground">Welcome,</p>
          <h1 className="font-display text-[3.5rem] leading-none text-foreground">
            {firstName}
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="ml-auto mr-[160px] border-2 border-foreground rounded-lg p-2 hover:bg-secondary transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Category & Search */}
      <div className="px-10 mt-6 relative z-10 ml-[160px] mr-[160px] flex items-center gap-6 flex-wrap">
        {category && (
          <span className="text-sm font-semibold text-muted-foreground">{category}</span>
        )}
        <div className="flex-1 max-w-[600px]">
          <div className="bg-foreground rounded-[50px] flex items-center px-6 py-3 shadow-lg">
            <input
              type="text"
              placeholder="Write tracking id to search...."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-transparent border-none outline-none text-background placeholder:text-background/50 text-sm font-medium"
            />
            <button onClick={handleSearch} className="text-background ml-2">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints grid */}
      <div className="px-10 py-8 relative z-10 ml-[160px] mr-[160px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              flagField="adminFlag"
              onClick={() => setSelectedComplaint(c)}
              subtitle={lastMessages[c.id]}
            />
          ))}
        </div>
        {complaints.length === 0 && (
          <div className="text-center text-muted-foreground py-20 text-lg">
            No complaints assigned to you yet.
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedComplaint && (
        <AdminComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
