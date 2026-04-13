import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import DecoWaves from "../components/DecoWaves";
import { ArrowLeft } from "lucide-react";

interface LoginPageProps {
  role: "Student" | "Admin";
  onBack: () => void;
  onLogin: (user: any) => void;
}

const LoginPage = ({ role, onBack, onLogin }: LoginPageProps) => {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err: any) {
      console.error("Login error:", err);
      alert("Sign-in failed: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 overflow-hidden">
      <DecoWaves side="left" />
      <DecoWaves side="right" />

      <div className="relative z-10 bg-background border-2 border-foreground/10 rounded-3xl p-12 max-w-[440px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.07)] animate-fade-up">
        <h2 className="text-[2.4rem] font-bold mb-2">Sign in</h2>
        <p className="text-muted-foreground text-base mb-8">
          Continue as <strong className="text-foreground">{role}</strong>
        </p>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-3 bg-background border-2 border-foreground rounded-xl py-4 px-6 w-full text-base font-semibold text-foreground transition-all hover:bg-secondary hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center text-center my-6 text-muted-foreground text-sm gap-4">
          <div className="flex-1 border-b border-input" />
          <span>or</span>
          <div className="flex-1 border-b border-input" />
        </div>

        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-muted-foreground text-[0.95rem] font-medium mx-auto hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
