interface SidebarProps {
  sessions: string[];
  activeSession: string | null;
  setActiveSession: (id: string) => void;
  createSession: () => void;
  removeSession: (id: string) => void;
}

export default function Sidebar({
  sessions,
  activeSession,
  setActiveSession,
  createSession,
  removeSession,
}: SidebarProps) {
  return (
    <div className="w-64 bg-black relative overflow-hidden border-r border-2 rgb-border p-4 flex flex-col sidebar-glow">

      {/* Floating Neon Orbs */}
      <div className="absolute top-10 left-5 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl float-dance"></div>
      <div className="absolute bottom-10 right-5 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl float-dance"></div>

      {/* New Chat Button */}
      <button
        onClick={createSession}
        className="relative z-10 bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-2 rounded-lg mb-4 font-semibold transition-all duration-300 hover:scale-105 pulse-glow shadow-[0_0_20px_rgba(0,255,255,0.8)]"
      >
        + New Chat
      </button>

      {/* Sessions List */}
      <div className="relative z-10 flex-1 overflow-y-auto space-y-3 pr-1">
        {sessions.length === 0 && (
          <p className="text-xs text-cyan-400 animate-pulse">
            No sessions yet
          </p>
        )}

        {sessions.map((id) => (
          <div
            key={id}
            onClick={() => {
              setActiveSession(id);
              localStorage.setItem("activeSession", id);
            }}
            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-xl hover-dance ${
              activeSession === id
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-[0_0_20px_rgba(0,255,255,0.8)] scale-105"
                : "bg-white/10 text-cyan-100 border border-cyan-400/20 hover:bg-white/20"
            }`}
          >
            <span className="truncate text-sm font-medium tracking-wide">
              {id.slice(0, 8)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSession(id);
              }}
              className="text-red-400 text-xs hover:text-red-300 hover:scale-125 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
