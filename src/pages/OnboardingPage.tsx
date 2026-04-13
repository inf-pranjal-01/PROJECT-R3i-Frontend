import { useState } from "react";
import DecoWaves from "../components/DecoWaves";
import { apiPost } from "../lib/api";

const CATEGORIES = [
  "Bathroom & Hygiene",
  "Anti-Ragging & Safety",
  "Mess & Food Quality",
  "Academic Issues",
  "Infrastructure_Maintenance",
  "Rules and Discipline",
  "Other",
];

interface OnboardingPageProps {
  user: any;
  role: "Student" | "Admin";
  onComplete: () => void;
}

const OnboardingPage = ({ user, role, onComplete }: OnboardingPageProps) => {
  const [room, setRoom] = useState("");
  const [contact, setContact] = useState("");
  const [roll, setRoll] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const firstName = user.displayName?.split(" ")[0]?.toUpperCase() || "USER";

  const handleProceed = async () => {
    if (role === "Student" && (!room || !contact || !roll)) {
      alert("Please fill in all fields.");
      return;
    }
    if (role === "Admin" && !category) {
      alert("Please select your department.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiPost<{ success?: boolean; error?: string }>("/onboard", {
        uid: user.uid,
        displayName: user.displayName || role,
        email: user.email || "",
        role: role.toLowerCase(),
        rollNumber: roll,
        roomNumber: room,
        contactNumber: contact,
        category: role === "Admin" ? category : "",
      });

      if (!res?.success) {
        throw new Error(res?.error || "Failed to save onboarding details.");
      }

      onComplete();
    } catch (err: any) {
      alert("Error: " + (err?.message || "Network error. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      <div className="relative z-10 max-w-[640px] w-full animate-fade-up">
        <div className="mb-8">
          <span className="font-accent text-[3rem] text-foreground">Hi,</span>
          <br />
          <span className="font-display text-[4.5rem] text-foreground leading-none">
            {firstName}
          </span>
        </div>

        <div className="border-[2.5px] border-foreground rounded-[20px] p-10">
          <p className="text-[0.85rem] font-bold tracking-[0.12em] text-foreground mb-6">
            ENTER DETAILS:
          </p>

          {role === "Student" ? (
            <div className="flex gap-4 flex-wrap">
              <div className="grad-pill flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="ROOM NO."
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-3 px-5 w-full text-[0.95rem] font-medium text-foreground text-center placeholder:text-muted-foreground"
                />
              </div>
              <div className="grad-pill flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="CONTACT NO."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-3 px-5 w-full text-[0.95rem] font-medium text-foreground text-center placeholder:text-muted-foreground"
                />
              </div>
              <div className="grad-pill flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="ROLL NO."
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-3 px-5 w-full text-[0.95rem] font-medium text-foreground text-center placeholder:text-muted-foreground"
                />
              </div>
            </div>
          ) : (
            <div className="grad-pill">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-3 px-5 w-full text-[0.95rem] font-medium text-foreground text-center appearance-none cursor-pointer"
              >
                <option value="">SELECT YOUR DEPARTMENT</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={handleProceed}
              disabled={saving}
              className="bg-foreground text-background border-none rounded-[50px] py-3 px-12 text-base font-semibold tracking-wide transition-all hover:opacity-80 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Proceed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
