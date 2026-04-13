import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import OnboardingPage from "./OnboardingPage";
import StudentHome from "./StudentHome";
import StudentChat from "./StudentChat";
import AdminDashboard from "./AdminDashboard";

type AppScreen =
  | "landing"
  | "login"
  | "onboarding"
  | "student-home"
  | "student-chat"
  | "admin-dashboard";

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [role, setRole] = useState<"Student" | "Admin">("Student");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [chatComplaint, setChatComplaint] = useState<any>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth state observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          const savedRole = data.role === "admin" ? "Admin" : "Student";
          setRole(savedRole);
          if (savedRole === "Admin") {
            setScreen("admin-dashboard");
          } else {
            setScreen("student-home");
          }
        }
        // If no profile, they'll go through onboarding via login flow
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleRoleSelect = (selectedRole: "Student" | "Admin") => {
    setRole(selectedRole);
    setScreen("login");
  };

  const handleLogin = async (firebaseUser: any) => {
    setUser(firebaseUser);
    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      setProfile(data);
      const savedRole = data.role === "admin" ? "Admin" : "Student";
      setRole(savedRole);
      if (savedRole === "Admin") {
        setScreen("admin-dashboard");
      } else {
        setScreen("student-home");
      }
    } else {
      setScreen("onboarding");
    }
  };

  const handleOnboardingComplete = async () => {
    if (user) {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    }
    if (role === "Admin") {
      setScreen("admin-dashboard");
    } else {
      setScreen("student-home");
    }
  };

  const handleOpenChat = (complaint: any) => {
    setChatComplaint(complaint);
    setIsNewChat(false);
    setScreen("student-chat");
  };

  const handleNewComplaint = () => {
    setChatComplaint(null);
    setIsNewChat(true);
    setScreen("student-chat");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setScreen("landing");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-display text-4xl text-foreground animate-pulse">R3i</div>
      </div>
    );
  }

  return (
    <>
      {screen === "landing" && <LandingPage onRoleSelect={handleRoleSelect} />}
      {screen === "login" && (
        <LoginPage role={role} onBack={() => setScreen("landing")} onLogin={handleLogin} />
      )}
      {screen === "onboarding" && user && (
        <OnboardingPage user={user} role={role} onComplete={handleOnboardingComplete} />
      )}
      {screen === "student-home" && user && (
        <StudentHome
          user={user}
          onOpenChat={handleOpenChat}
          onNewComplaint={handleNewComplaint}
          onLogout={handleLogout}
        />
      )}
      {screen === "student-chat" && user && (
        <StudentChat
          user={user}
          complaint={chatComplaint}
          isNew={isNewChat}
          onBack={() => setScreen("student-home")}
        />
      )}
      {screen === "admin-dashboard" && user && (
        <AdminDashboard user={user} profile={profile} onLogout={handleLogout} />
      )}
    </>
  );
};

export default Index;
