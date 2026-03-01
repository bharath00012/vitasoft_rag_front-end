import { useEffect, useState, useRef, ChangeEvent } from "react";
import {
  sendMessage,
  getHistory,
  deleteHistory,
  uploadDocument,
} from "../services/api";
import axios from "axios";
interface Message {
  role: string;
  text: string;
  timestamp?: string | Date;
  score?: number;
  responseTime?: number;
}

interface SessionFile {
  filename: string;
  originalName?: string;
  uploadedAt?: string;
}

interface ChatWindowProps {
  sessionId: string;
  removeSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
}

export default function ChatWindow({
  sessionId,
  removeSession,
  setActiveSession,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionFile, setSessionFile] = useState<SessionFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
  "idle" | "uploading" | "uploaded"
>("idle");

  /* ===============================
     LOAD SESSION HISTORY
  =============================== */
  const loadHistory = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const res = await getHistory(sessionId);
      const data = res.data;

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setSessionFile(data.file || null);
      setChunkCount(data.chunkCount || 0);
    } catch (error) {
      console.error("Error loading history:", error);
      setMessages([]);
      setSessionFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [sessionId]);
  /* ===============================
     AUTO SCROLL
  =============================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     SEND MESSAGE
  =============================== */
  
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    const startTime = Date.now();
    const userMsg: Message = {
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendMessage(sessionId, userMsg.text);
      const endTime = Date.now(); // ✅ END TIMER
      const responseTime = (endTime - startTime) / 1000; // in seconds
      const botMsg: Message = {
        role: "bot",
        text: res.data?.answer || "No response",
        score: res.data?.score || 0,
        timestamp: new Date(),
        responseTime: responseTime,

      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Server error",
          score: 0,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
     DELETE SESSION
  =============================== */
  const handleDeleteChat = async () => {
    if (!sessionId) return;

    try {
      await deleteHistory(sessionId);

      localStorage.removeItem("activeSession");

      if (removeSession) removeSession(sessionId);
      if (setActiveSession) setActiveSession(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat");
    }
  };
const handleDeleteChatMessages = async () => {
  if (!sessionId) return;

  if (!window.confirm("Are you sure you want to delete all chat messages for this session?")) return;

  setIsLoading(true);

  try {
    const res = await fetch(`http://localhost:5000/sessions/${sessionId}/chats`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      alert("Chat messages deleted successfully.");
      setMessages([]); // Clear messages in UI
    } else {
      alert("Failed to delete chat messages.");
    }
  } catch (error) {
    console.error("Error deleting chat messages:", error);
    alert("Error deleting chat messages.");
  } finally {
    setIsLoading(false);
  }
};
  /* ===============================
     UPLOAD DOCUMENT
  =============================== */
 const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const file = e.target.files[0];
  if (!file || !sessionId) return;

  setUploadStatus("uploading"); // ✅ show uploading

  try {
    const res = await uploadDocument(sessionId, file);

    await loadHistory();

    if (res.data?.file) {
      setSessionFile({
        filename: res.data.file.filename,
        originalName: res.data.file.originalName,
        uploadedAt: res.data.file.uploadedAt,
      });
    }

    setUploadStatus("uploaded"); // ✅ show uploaded

    // Optional: auto hide "uploaded" after 2 seconds
    setTimeout(() => {
      setUploadStatus("idle");
    }, 2000);

  } catch (error) {
    console.error(`Error uploading ${file.name}:`, error);
    alert(`Failed to upload ${file.name}`);
    setUploadStatus("idle");
  }

  if (e.target) e.target.value = "";
};
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-black via-gray-950 to-black text-white relative overflow-hidden">

      {/* Holographic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,0,255,0.12),transparent_40%)] animate-pulse pointer-events-none"></div>
      <br></br>
      <br></br>
      {/* ================= HEADER ================= */}
      <div className="relative p-4 backdrop-blur-xl bg-white/5 border-b border-cyan-500/30 shadow-[0_0_25px_rgba(0,255,255,0.15)]">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-cyan-400 font-bold text-lg tracking-widest drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
            Session: {sessionId?.slice(0, 12)}
          </h2>

          <div className="flex gap-2">
            <label className="px-3 py-1 rounded text-white cursor-pointer text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all duration-300">
              + Upload
              <input type="file" onChange={handleUpload} className="hidden" />
            </label>

            <button
              onClick={handleDeleteChat}
              className="px-3 py-1 rounded text-white text-sm bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 shadow-[0_0_15px_rgba(255,0,100,0.6)] transition-all duration-300"
            >
              Delete
            </button>
            <button
  onClick={handleDeleteChatMessages}
  disabled={isLoading}
  className="px-3 py-1 rounded text-white text-sm bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 shadow-[0_0_15px_rgba(255,200,0,0.6)] transition-all duration-300"
>
  Delete Chat Messages
</button>
          </div>
        </div>
       {uploadStatus === "uploading" && (
  <p className="text-sm text-yellow-400 mt-2 animate-pulse">
    Uploading document...
  </p>
)}

{uploadStatus === "uploaded" && (
  <p className="text-sm text-green-400 mt-2">
    Document uploaded successfully ✓
  </p>
)}
        {sessionFile && (
  <div className="mt-3 p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
    
    {/* Title */}
    <p className="text-xs text-cyan-300 mb-2">
      📎 Uploaded Document:
    </p>

    {/* File Row */}
    <div className="flex justify-between items-center gap-2">
      
      {/* Filename (Left) */}
      <a
        href={`http://localhost:5000/uploads/${sessionFile.filename}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-sm px-3 py-2 rounded font-semibold break-words max-w-xs shadow-[0_0_15px_rgba(0,255,255,0.6)]"
      >
        {sessionFile.originalName ||
          sessionFile.filename ||
          "Unnamed File"}
      </a>

      {/* Date (Right) */}
      {sessionFile.uploadedAt && (
        <span className="text-xs text-cyan-300 whitespace-nowrap">
          {new Date(sessionFile.uploadedAt).toLocaleDateString()}
        </span>
      )}
    </div>

    {/* Chunk Count (Right Side Underneath) */}
    {chunkCount > 0 && (
      <div className="mt-3 text-right">
        <span className="text-xs bg-cyan-400/20 px-3 py-1 rounded border border-cyan-400/40">
          Total Number of chunks after embedding: {chunkCount} chunks
        </span>
      </div>
    )}

  </div>
)}
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="relative flex-1 overflow-y-auto p-6 space-y-3">
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-cyan-400 animate-pulse">
              Loading chat history...
            </p>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-cyan-400">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-md text-sm backdrop-blur-xl ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-br-none shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                  : "bg-white/10 text-cyan-100 rounded-bl-none border border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
              }`}
            >
              <p>{msg.text}</p>
             {msg.score !== undefined && <p>Score: {msg.score}</p>}

{msg.responseTime !== undefined && (
  <p className="text-xs mt-1 text-cyan-300 opacity-80">
    ⏱ Response Time: {msg.responseTime.toFixed(2)} sec
  </p>
)}
              {msg.timestamp && (
                <p className="text-xs mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="relative p-4 border-t border-cyan-500/30 backdrop-blur-xl bg-white/5 flex gap-3">
       <input
  className="flex-1 bg-white/10 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-400 backdrop-blur-xl focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
  placeholder="Ask something..."
  value={input}
  onChange={(e) => {
    if (e.target.value.length <= 2000) {  // limit like ChatGPT
      setInput(e.target.value);
    }
  }}
  onKeyDown={(e) => e.key === "Enter" && handleSend()}
  disabled={isLoading}
  maxLength={2000} // enforces the input limit
/>

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.7)]"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
