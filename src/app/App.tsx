import { Routes, Route } from "react-router";
import DashboardPage from "./pages/DashboardPage";
import SobrePage from "./pages/SobrePage";
import { InstallPromptModal } from "./components/InstallPromptModal";

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 5 === 0 ? "#00d4ff" : i % 7 === 0 ? "#7c3aed" : "#e2eaf5",
    opacity: Math.random() * 0.4 + 0.1,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size + "px",
            height: s.size + "px",
            left: s.left + "%",
            top: s.top + "%",
            background: s.color,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: s.delay + "s",
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      <StarField />

      {/* Ambient glow orbs */}
      <div className="fixed pointer-events-none" style={{
        left: "20%", top: "30%", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)", zIndex: 0,
      }} />
      <div className="fixed pointer-events-none" style={{
        left: "80%", top: "70%", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)", zIndex: 0,
      }} />

      <Routes>
        <Route path="/" element={<SobrePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>

      <InstallPromptModal />
    </div>
  );
}
