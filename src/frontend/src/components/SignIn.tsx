import { useEffect, useRef, useState } from "react";

interface SignInProps {
  onSignIn: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 15 + 10,
    opacity: Math.random() * 0.5 + 0.1,
    delay: Math.random() * 8,
  }));
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [particles] = useState<Particle[]>(() => generateParticles(40));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    const upperPassword = password.trim().toUpperCase();

    if (upperPassword === "GRANITE") {
      onSignIn();
    } else {
      setError("Incorrect password. Access denied.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        background: "#0D1117",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Granite texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(/assets/generated/granite-bg.dim_1920x1080.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.25,
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,58,95,0.3) 0%, transparent 70%), linear-gradient(180deg, #0D1117 0%, #1A1F25 100%)",
        }}
      />

      {/* Animated particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background:
              p.id % 3 === 0
                ? "#4A9EFF"
                : p.id % 3 === 1
                  ? "#8A929C"
                  : "#E8ECF0",
            opacity: p.opacity,
            animation: `float-particle ${p.speed}s linear ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(74,158,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,158,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main card */}
      <div
        className="animate-fade-in"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%" }}
              aria-label="Granite mountain logo"
              role="img"
            >
              <defs>
                <linearGradient
                  id="mountainGrad"
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#2A3A4E" />
                  <stop offset="50%" stopColor="#4A9EFF" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E8ECF0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="#363D47"
                strokeWidth="1"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="#4A9EFF"
                strokeWidth="0.5"
                fill="none"
                opacity="0.4"
              />
              <polygon
                points="40,10 68,62 12,62"
                fill="url(#mountainGrad)"
                filter="url(#glow)"
              />
              <polygon
                points="40,10 55,40 25,40"
                fill="rgba(232,236,240,0.15)"
              />
              <polygon
                points="40,10 47,26 33,26"
                fill="rgba(232,236,240,0.85)"
              />
              <rect x="12" y="62" width="56" height="4" rx="2" fill="#363D47" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              letterSpacing: "0.3em",
              color: "#E8ECF0",
              margin: "0 0 8px",
              background:
                "linear-gradient(135deg, #8A929C 0%, #E8ECF0 40%, #4A9EFF 60%, #E8ECF0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            GRANITE
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#8A929C",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Your Creative Studio
          </p>
        </div>

        {/* Sign-in form */}
        <div
          style={{
            width: "100%",
            background: "rgba(34,39,46,0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid #363D47",
            borderRadius: "16px",
            padding: "32px",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "#8A929C",
              textAlign: "center",
              marginBottom: "24px",
              letterSpacing: "0.05em",
            }}
          >
            ENTER STUDIO PASSWORD
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                data-ocid="signin.input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  height: "48px",
                  background: "rgba(26,31,37,0.8)",
                  border: error ? "1px solid #E8594A" : "1px solid #363D47",
                  borderRadius: "10px",
                  color: "#E8ECF0",
                  padding: "0 16px",
                  fontSize: "1rem",
                  letterSpacing: "0.15em",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = "#4A9EFF";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(74,158,255,0.15)";
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.borderColor = "#363D47";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>

            {error && (
              <p
                data-ocid="signin.error_state"
                style={{
                  color: "#E8594A",
                  fontSize: "0.8rem",
                  textAlign: "center",
                  margin: "0",
                  padding: "8px 12px",
                  background: "rgba(232,89,74,0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(232,89,74,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <button
              data-ocid="signin.submit_button"
              type="submit"
              style={{
                width: "100%",
                height: "48px",
                background: "linear-gradient(135deg, #4A9EFF, #2A7ED0)",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                fontSize: "0.9rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(74,158,255,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "1";
              }}
            >
              ENTER STUDIO
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p
          style={{
            fontSize: "0.7rem",
            color: "rgba(138,146,156,0.5)",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          Secured access · Granite Creative Suite
        </p>
      </div>
    </div>
  );
}
