import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import {
  getSessions,
  createSessionRecord,
  deleteSessionRecord,
} from "./services/api";
import RagConfigModal from "./components/RagConfigModal";
interface SessionResponse {
  sessionId: string;
  messages?: any[];
}

function App() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  // load sessions from backend on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSessions();
        console.log("=== SESSIONS RESPONSE ===");
        console.log("All sessions:", res.data);

        const list: string[] = Array.isArray(res.data)
          ? res.data.map((s: SessionResponse) => s.sessionId)
          : [];
        console.log("Session IDs extracted:", list);

        // Log each session's message count
        if (Array.isArray(res.data)) {
          res.data.forEach((session: SessionResponse) => {
            console.log(
              `Session ${session.sessionId.slice(0, 8)}: ${
                session.messages?.length || 0
              } messages`
            );
          });
        }

        setSessions(list);

        // restore activeSession from localStorage if it exists in the list
        const savedSession = localStorage.getItem("activeSession");
        if (savedSession && list.includes(savedSession)) {
          setActiveSession(savedSession);
        } else if (list.length > 0 && !activeSession) {
          setActiveSession(list[0]);
        }
      } catch (err) {
        console.error("❌ Error fetching sessions:", err);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = async () => {
    const id = uuidv4();
    setSessions((prev) => [...prev, id]);
    setActiveSession(id);
    localStorage.setItem("activeSession", id);
    try {
      await createSessionRecord(id);
    } catch (err) {
      console.error("failed to create session record", err);
    }
  };

  const removeSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s !== id));
    if (activeSession === id) setActiveSession(null);
    try {
      await deleteSessionRecord(id);
    } catch (err) {
      console.error("failed to delete session record", err);
    }
  };

  return (
    <div className="flex h-screen relative">
      <button
  onClick={() => setShowConfig(true)}
  className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-lg z-50"
>
  ⚙ RAG Settings
</button>
      <Sidebar
        sessions={sessions}
        activeSession={activeSession}
        setActiveSession={setActiveSession}
        createSession={createSession}
        removeSession={removeSession}
      />
      {activeSession ? (
  <ChatWindow
    sessionId={activeSession}
    removeSession={removeSession}
    setActiveSession={setActiveSession}


  />
) : (
  <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-black via-gray-950 to-black text-white relative overflow-hidden">

    {/* Animated Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,255,255,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(255,0,255,0.1),transparent_50%)] animate-pulse pointer-events-none"></div>

    {/* Animated Orb */}
    <div className="relative flex flex-col items-center">

      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse shadow-[0_0_60px_rgba(0,255,255,0.9)] mb-8"></div>

      <h2 className="text-2xl font-bold text-cyan-400 mb-3 tracking-wider">
        Waiting to chat with RAG...
      </h2>

      <p className="text-cyan-300 opacity-70 text-center max-w-md">
        Create a new session from the sidebar and start asking questions.
      </p>

      {/* Animated Dots */}
      <div className="flex gap-2 mt-6">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-300"></span>
      </div>

    </div>
  </div>
)}
<RagConfigModal
  isOpen={showConfig}
  onClose={() => setShowConfig(false)}
/>
    </div>
    
  );
}

export default App;
