import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { apiPost } from "../lib/api";
import { statusLabel, timeAgo } from "../lib/helpers";
import { X } from "lucide-react";

interface AdminComplaintDetailProps {
  complaint: any;
  onClose: () => void;
}

interface Message {
  id: string;
  type: "student" | "admin" | "system";
  raw?: string;
  enhanced?: string;
  response?: string;
  content?: string;
  createdAt?: any;
}

const AdminComplaintDetail = ({ complaint, onClose }: AdminComplaintDetailProps) => {
  const [response, setResponse] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("action");
  const [sending, setSending] = useState(false);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Listen to ALL messages in the complaint subcollection
  useEffect(() => {
    const messagesRef = collection(db, "complaints", complaint.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      console.log("[AdminDetail] Messages received:", msgs.length);
      setAllMessages(msgs);
    });
    return unsub;
  }, [complaint.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = async () => {
    if (!response.trim()) {
      alert("Please write a response.");
      return;
    }
    setSending(true);
    try {
      const res = await apiPost("/admin/message", {
        complaint_id: complaint.id,
        response: response.trim(),
        status_update: statusUpdate,
      });
      if (res.success) {
        setResponse("");
      } else {
        alert("Error: " + (res.error || "Unknown"));
      }
    } catch {
      alert("Network error.");
    }
    setSending(false);
  };

  const isResolved = complaint.status === "resolved";
  const time = timeAgo(complaint.createdAt);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border-[2.5px] border-foreground rounded-2xl p-8 max-w-[700px] w-full max-h-[90vh] overflow-hidden z-10 animate-fade-up flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="border border-foreground rounded-lg px-4 py-1.5 text-sm font-bold">
            {complaint.trackingId}
          </span>
          <span className="text-xs text-muted-foreground">{time}</span>
          <span
            className={`ml-auto text-xs font-bold px-3 py-1 rounded-lg ${
              complaint.status === "resolved"
                ? "bg-r3i-green/20 text-r3i-green"
                : complaint.adminFlag === "red"
                ? "bg-r3i-red/20 text-r3i-red"
                : "bg-r3i-yellow/20 text-r3i-yellow"
            }`}
          >
            {statusLabel(complaint.status)}
          </span>
        </div>

        {/* Student info */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="border border-foreground rounded-lg px-4 py-2 text-sm font-semibold">
            {complaint.studentName || "Student"}
          </span>
          <span className="border border-foreground rounded-lg px-4 py-2 text-sm font-semibold">
            {complaint.roomNumber || "N/A"}
          </span>
          <span className="border border-foreground rounded-lg px-4 py-2 text-sm font-semibold">
            {complaint.contactNumber || "N/A"}
          </span>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto border-2 border-foreground rounded-xl p-4 mb-4 min-h-[200px] max-h-[40vh]">
          {allMessages.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">Loading messages...</p>
          )}
          {allMessages.map((msg) => {
            if (msg.type === "student") {
              return (
                <div key={msg.id} className="flex justify-end mb-3">
                  <div className="bg-foreground text-background rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] text-sm">
                    <span className="text-xs font-bold opacity-70 block mb-1">STUDENT</span>
                    {msg.enhanced || msg.raw || msg.content || ""}
                  </div>
                </div>
              );
            }
            if (msg.type === "admin") {
              return (
                <div key={msg.id} className="flex justify-start mb-3">
                  <div className="border-2 border-foreground rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] text-sm">
                    <span className="text-xs font-bold text-muted-foreground block mb-1">ADMIN</span>
                    {msg.response || msg.content || ""}
                  </div>
                </div>
              );
            }
            // system messages
            return (
              <div key={msg.id} className="flex justify-center mb-3">
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1">
                  {msg.content || msg.enhanced || ""}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Response area */}
        {!isResolved && (
          <>
            <div className="grad-pill mb-4">
              <textarea
                placeholder="Write response here if any ......"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
                className="grad-pill-inner bg-background border-none outline-none rounded-2xl py-4 px-5 w-full text-sm text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="border border-foreground rounded-lg overflow-hidden">
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="bg-background px-4 py-2 text-sm font-semibold outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="action">Request Info</option>
                  <option value="resolved">Mark Resolved</option>
                </select>
              </div>
              <span className="text-xs text-muted-foreground">SELECT STATUS</span>

              <button
                onClick={handleSend}
                disabled={sending}
                className="ml-auto bg-foreground text-background rounded-[50px] px-8 py-2.5 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}

        {isResolved && (
          <p className="text-center text-muted-foreground text-sm mt-4">
            This complaint has been resolved.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
