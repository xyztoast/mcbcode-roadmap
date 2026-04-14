import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthed: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthed: false,
  login: () => false,
  logout: () => {},
});

const PASSCODE = "mcbCode123";
const STORAGE_KEY = "mcb_authed";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");

  const login = (passcode: string) => {
    if (passcode === PASSCODE) {
      setIsAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthed(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
