import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const { login, isAuthed, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(passcode)) {
      navigate("/");
    } else {
      setError(true);
      setPasscode("");
    }
  };

  if (isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded p-6 max-w-sm w-full text-center space-y-4">
          <h1 className="text-xl text-primary font-mcb">Authenticated</h1>
          <p className="text-muted-foreground text-sm">You have edit access.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">Dashboard</button>
            <button onClick={logout} className="px-4 py-2 bg-muted text-muted-foreground rounded text-sm hover:text-foreground">Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded p-6 max-w-sm w-full space-y-4">
        <h1 className="text-xl text-primary font-mcb">Access</h1>
        <input
          type="password"
          value={passcode}
          onChange={(e) => { setPasscode(e.target.value); setError(false); }}
          placeholder="Enter passcode"
          className="w-full bg-background border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        {error && <p className="text-destructive text-xs">Incorrect passcode.</p>}
        <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground rounded text-sm font-mc">Enter</button>
      </form>
    </div>
  );
};

export default LoginPage;
