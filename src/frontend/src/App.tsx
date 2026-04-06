import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import DrawingApp from "./components/DrawingApp";
import SignIn from "./components/SignIn";

const AUTH_KEY = "granite_authenticated";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(AUTH_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [isAuthenticated]);

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="granite-app">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#2A2F37",
            border: "1px solid #363D47",
            color: "#E8ECF0",
          },
        }}
      />
      {isAuthenticated ? (
        <DrawingApp onSignOut={handleSignOut} />
      ) : (
        <SignIn onSignIn={handleSignIn} />
      )}
    </div>
  );
}
