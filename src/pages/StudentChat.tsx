import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { apiPost } from "../lib/api";
import DecoWaves from "../components/DecoWaves";
import { ArrowRight, Plus, ArrowLeft } from "lucide-react";

interface StudentChatProps {
  user: any;
  complaint?: any;
  isNew: boolean;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: "student" | "admin" | "system";
  raw?: string;
  enhanced?: string;
  response?: string;
  content?: string;
}

function getMessageText(message: ChatMessage) {
  return [message.raw, message.content, message.response, message.enhanced]
    .find((value) => typeof value === "string" && value.trim())
    ?.trim()
    .replace(/\s+/g, " ") ?? "";
}

function getMessageSignature(message: ChatMessage) {
  return `${message.type}:${getMessageText(message).toLowerCase()}`;
}

function mergeDisplayedMessages(
  local: ChatMessage[],
  firestore: ChatMessage[],
  preserveLocalTimeline: boolean
) {
  if (!preserveLocalTimeline) {
    return [...firestore, ...removePersistedLocalMessages(local, firestore)];
  }

  const availableFirestoreMessages = new Map<string, ChatMessage[]>();
  const usedFirestoreIds = new Set<string>();

  firestore.forEach((message) => {
    if (message.type === "system") return;

    const signature = getMessageSignature(message);
    if (signature.endsWith(":")) return;

    const existing = availableFirestoreMessages.get(signature) || [];
    existing.push(message);
    availableFirestoreMessages.set(signature, existing);
  });

  const mergedLocalTimeline = local.map((message) => {
    if (message.type === "system") return message;

    const signature = getMessageSignature(message);
    const matchingMessages = availableFirestoreMessages.get(signature);

    if (!matchingMessages?.length) return message;

    const persistedMessage = matchingMessages.shift() as ChatMessage;
    usedFirestoreIds.add(persistedMessage.id);
    return persistedMessage;
  });

  const remainingFirestoreMessages = firestore.filter(
    (message) => !usedFirestoreIds.has(message.id)
  );

  return [...mergedLocalTimeline, ...remainingFirestoreMessages];
}

function removePersistedLocalMessages(local: ChatMessage[], firestore: ChatMessage[]) {
  const firestoreCounts = new Map<string, number>();

  firestore.forEach((message) => {
    if (message.type === "system") return;

    const signature = getMessageSignature(message);
    if (signature.endsWith(":")) return;

    firestoreCounts.set(signature, (firestoreCounts.get(signature) || 0) + 1);
  });

  let changed = false;

  const nextLocal = local.filter((message) => {
    if (message.type === "system") return true;

    const signature = getMessageSignature(message);
    const availableCount = firestoreCounts.get(signature) || 0;

    if (!availableCount) return true;

    changed = true;
    firestoreCounts.set(signature, availableCount - 1);
    return false;
  });

  return changed ? nextLocal : local;
}

const StudentChat = ({ user, complaint, isNew, onBack }: StudentChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState(
    complaint?.shortTitle?.toUpperCase() || "NEW COMPLAINT"
  );
  const [currentComplaintId, setCurrentComplaintId] = useState(
    complaint?.id || null
  );
  const [complaintData, setComplaintData] = useState(complaint || null);

  const [chatState, setChatState] = useState<
    "idle" | "categorizing" | "category_select" | "confirming" | "registered" | "reply"
  >(isNew ? "idle" : "reply");
  const [buttons, setButtons] = useState<string[]>([]);
  const [pendingCategory, setPendingCategory] = useState<any>(null);

  // Keep local messages separate so Firestore listener doesn't overwrite them
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [firestoreMessages, setFirestoreMessages] = useState<ChatMessage[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Merge local + firestore messages
  useEffect(() => {
    setMessages(
      currentComplaintId
        ? mergeDisplayedMessages(localMessages, firestoreMessages, isNew)
        : localMessages
    );
  }, [localMessages, firestoreMessages, currentComplaintId, isNew]);

  useEffect(() => {
    if (!currentComplaintId || !firestoreMessages.length) return;

    setLocalMessages((prev) => removePersistedLocalMessages(prev, firestoreMessages));
  }, [currentComplaintId, firestoreMessages]);

  // Listen for messages on existing complaint
  useEffect(() => {
    if (!currentComplaintId) return;
    console.log("[StudentChat] Listening for messages on complaint:", currentComplaintId);
    const q = query(
      collection(db, "complaints", currentComplaintId, "messages"),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as ChatMessage)
        );
        console.log("[StudentChat] Firestore messages received:", msgs.length);
        setFirestoreMessages(msgs);
      },
      (error) => {
        console.error("[StudentChat] Firestore messages listener error:", error);
      }
    );
    return unsub;
  }, [currentComplaintId]);

  // Listen for complaint status changes
  useEffect(() => {
    if (!currentComplaintId) return;
    const unsub = onSnapshot(
      doc(db, "complaints", currentComplaintId),
      (snap) => {
        if (snap.exists()) {
          setComplaintData({ id: snap.id, ...snap.data() });
        }
      },
      (error) => {
        console.error("[StudentChat] Complaint status listener error:", error);
      }
    );
    return unsub;
  }, [currentComplaintId]);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [messages, buttons]);

  const addLocalMessage = (msg: Partial<ChatMessage>) => {
    const newMsg = { id: crypto.randomUUID(), ...msg } as ChatMessage;
    setLocalMessages((prev) => [...prev, newMsg]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    if (chatState === "idle" && isNew) {
      addLocalMessage({ type: "student", raw: text });
      setLoading(true);
      setChatState("categorizing");
      console.log("[StudentChat] Sending to /chat/categorize:", text);
      try {
        const res = await apiPost("/chat/categorize", { message: text });
        console.log("[StudentChat] Categorize response:", res);
        addLocalMessage({ type: "system", content: res.message });
        setButtons(res.buttons || []);
        setPendingCategory(res);
        setChatTitle(res.short_title?.toUpperCase() || "COMPLAINT");
        if (res.low_confidence) {
          setChatState("category_select");
        } else {
          setChatState("confirming");
        }
      } catch (err: any) {
        console.error("[StudentChat] Categorize error:", err);
        addLocalMessage({
          type: "system",
          content: "Error: " + (err?.message || "Network error. Please try again."),
        });
        setChatState("idle");
      }
      setLoading(false);
    } else if (chatState === "reply" && currentComplaintId) {
      setLoading(true);
      try {
        await apiPost("/chat/reply", {
          complaint_id: currentComplaintId,
          message: text,
        });
        console.log("[StudentChat] Reply sent successfully");
      } catch (err: any) {
        console.error("[StudentChat] Reply error:", err);
        addLocalMessage({
          type: "system",
          content: "Failed to send reply: " + (err?.message || "Unknown error"),
        });
      }
      setLoading(false);
    }
  };

  const handleButtonClick = async (btn: string) => {
    addLocalMessage({ type: "student", raw: btn });
    setButtons([]);
    setLoading(true);

    if (chatState === "category_select") {
      try {
        console.log("[StudentChat] Selecting category:", btn);
        const res = await apiPost("/chat/select-category", {
          selected_category: btn,
          short_title: pendingCategory?.short_title || "Complaint",
        });
        console.log("[StudentChat] Category select response:", res);
        addLocalMessage({ type: "system", content: res.message });
        setButtons(res.buttons || []);
        setPendingCategory(res);
        setChatState("confirming");
      } catch (err: any) {
        console.error("[StudentChat] Category select error:", err);
        addLocalMessage({
          type: "system",
          content: "Error: " + (err?.message || "Try again."),
        });
        setChatState("idle");
      }
    } else if (chatState === "confirming") {
      if (btn === "Yes") {
        try {
          const studentMsg = localMessages.find((m) => m.type === "student");
          console.log("[StudentChat] Registering complaint...");
          addLocalMessage({
            type: "system",
            content: "Registering your complaint... This may take a moment.",
          });
          const res = await apiPost(
            "/chat/register",
            {
              student_id: user.uid,
              raw_message: studentMsg?.raw || "",
              category: pendingCategory?.category || "Other",
              short_title: pendingCategory?.short_title || "Complaint",
              confidence: pendingCategory?.confidence || 0,
            },
            90000 // 90s timeout for register (it calls AI enhancer)
          );
          console.log("[StudentChat] Register response:", res);
          addLocalMessage({ type: "system", content: res.message });
          if (res.complaint_doc_id) {
            setCurrentComplaintId(res.complaint_doc_id);
            setChatState("reply");
          } else {
            setChatState("registered");
          }
        } catch (err: any) {
          console.error("[StudentChat] Register error:", err);
          addLocalMessage({
            type: "system",
            content: "Registration failed: " + (err?.message || "Unknown error"),
          });
          setChatState("idle");
        }
      } else {
        try {
          const res = await apiPost("/chat/cancel", {});
          addLocalMessage({ type: "system", content: res.message });
        } catch {
          addLocalMessage({
            type: "system",
            content: "No problem! Let me know if you'd like to report anything else.",
          });
        }
        setChatState("idle");
      }
    }
    setLoading(false);
  };

  const isResolved = complaintData?.status === "resolved";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-sm z-50 border-b border-input">
        <button
          onClick={onBack}
          className="w-11 h-[38px] border-[2.5px] border-foreground rounded-lg bg-background flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="border border-foreground rounded-[50px] px-6 py-2 text-sm font-semibold">
          {chatTitle}
        </div>
        <div className="w-11" />
      </div>

      {/* Chat messages */}
      <div className="flex-1 pt-24 pb-40 px-6 overflow-y-auto relative z-10 max-w-[800px] mx-auto w-full flex flex-col">
        <div className="flex-1" />
        {messages.map((msg) => {
          if (msg.type === "student") {
            return (
              <div key={msg.id} className="flex justify-end mb-4">
                <div className="bg-foreground text-background rounded-2xl rounded-br-sm px-5 py-3 max-w-[70%] text-sm">
                  {msg.raw || msg.content}
                </div>
              </div>
            );
          }
          if (msg.type === "admin") {
            return (
              <div key={msg.id} className="flex justify-start mb-4">
                <div className="border-2 border-foreground rounded-2xl rounded-bl-sm px-5 py-3 max-w-[70%] text-sm">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">
                    ADMIN
                  </span>
                  {msg.response || msg.content || ""}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex justify-start mb-4">
              <div className="border-2 border-foreground rounded-2xl rounded-bl-sm px-5 py-3 max-w-[70%] text-sm">
                {msg.content || msg.enhanced || msg.response}
                {pendingCategory?.confidence != null &&
                  msg.content?.includes("proceed") && (
                    <span className="block text-xs text-muted-foreground mt-1">
                      ▼ {Math.round(pendingCategory.confidence * 100)}%
                    </span>
                  )}
              </div>
            </div>
          );
        })}

        {/* Typing / loading indicator */}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="border-2 border-foreground rounded-2xl rounded-bl-sm px-5 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion buttons */}
      {buttons.length > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 flex gap-3 flex-wrap justify-center max-w-[600px]">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              disabled={loading}
              className="border-2 border-foreground rounded-[50px] px-6 py-2 text-sm font-semibold bg-background hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {btn}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      {!isResolved && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-5 z-40 flex justify-center">
          <div className="grad-pill max-w-[700px] w-full">
            <div className="grad-pill-inner bg-background flex items-center px-4 py-2">
              <button className="text-foreground mr-2">
                <Plus size={22} />
              </button>
              <input
                type="text"
                placeholder="write here......"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading || (chatState !== "idle" && chatState !== "reply")}
                className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center ml-2 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isResolved && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-5 z-40">
          {(() => {
            const lastAdmin = [...messages].reverse().find((m) => m.type === "admin");
            return lastAdmin ? (
              <div className="max-w-[700px] mx-auto mb-2 border-2 border-foreground rounded-2xl px-5 py-3 text-sm bg-background">
                <span className="text-xs font-bold text-muted-foreground block mb-1">LAST ADMIN RESPONSE</span>
                {lastAdmin.response || lastAdmin.content || ""}
              </div>
            ) : null;
          })()}
          <p className="text-center text-muted-foreground text-sm">
            This complaint has been resolved and is now closed.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentChat;
