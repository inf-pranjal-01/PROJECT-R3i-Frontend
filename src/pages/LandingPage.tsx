import { useState } from "react";
import DecoWaves from "../components/DecoWaves";

interface LandingPageProps {
  onRoleSelect: (role: "Student" | "Admin") => void;
}

const LandingPage = ({ onRoleSelect }: LandingPageProps) => {
  const [selected, setSelected] = useState("");

  const handleChange = (value: string) => {
    setSelected(value);
    if (value === "Student" || value === "Admin") {
      onRoleSelect(value);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      {/* Brand badge */}
      <div className="absolute top-6 right-6 text-center text-[0.6rem] font-bold tracking-widest text-muted-foreground border-[1.5px] border-foreground rounded-[10px] px-3 py-2 z-10">
        DESIGNED AND DEVELOPED BY
        <span className="block text-[0.7rem] font-bold text-foreground">BIT RANCHI · RECORE</span>
      </div>

      {/* Main card */}
      <div className="relative z-10 border-[2.5px] border-foreground rounded-[28px] px-14 py-12 text-center max-w-[520px] w-full animate-fade-up bg-background">
        <p className="font-accent text-[2.2rem] text-foreground mb-1">Welcome to</p>
        <h1 className="font-display text-[5.5rem] leading-none text-foreground mb-8 tracking-wide">
          PROJECT R3i
        </h1>

        <div className="border-2 border-foreground rounded-2xl px-6 py-5">
          <p className="text-[0.85rem] font-bold tracking-[0.1em] text-foreground mb-4">
            SELECT YOUR ROLE
          </p>
          <div className="grad-pill">
            <select
              value={selected}
              onChange={(e) => handleChange(e.target.value)}
              className="grad-pill-inner bg-background border-none outline-none rounded-[50px] py-3 px-5 w-full text-base font-semibold text-foreground text-center appearance-none cursor-pointer"
            >
              <option value="">▼</option>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
