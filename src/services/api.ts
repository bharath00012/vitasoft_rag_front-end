import axios, { AxiosResponse } from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export interface SessionData {
  sessionId: string;
  messages?: any[];
  file?: any;
  chunkCount?: number;
}

/* -------------------- CHAT -------------------- */

export const sendMessage = (
  sessionId: string,
  question: string
): Promise<AxiosResponse<any>> =>
  API.post("/query", { sessionId, question });

export const getHistory = (
  sessionId: string
): Promise<AxiosResponse<any>> =>
  API.get(`/sessions/${sessionId}`);

export const deleteHistory = (
  sessionId: string
): Promise<AxiosResponse<any>> =>
  API.delete(`/sessions/${sessionId}`);

/* -------------------- FILE UPLOAD -------------------- */

export const uploadDocument = (
  sessionId: string,
  file: File
): Promise<AxiosResponse<any>> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);

  return API.post("/upload", formData);
};

/* -------------------- SESSIONS -------------------- */

export const getSessions = (): Promise<AxiosResponse<any>> =>
  API.get("/sessions");

export const createSessionRecord = (
  sessionId: string
): Promise<AxiosResponse<any>> =>
  API.post("/sessions", { sessionId });

export const deleteSessionRecord = (
  sessionId: string
): Promise<AxiosResponse<any>> =>
  API.delete(`/sessions/${sessionId}`);

/* -------------------- RAG CONFIG -------------------- */

export const getRagConfig = () =>
  API.get("/rag-config");

export const updateRagConfig = (data: any) =>
  API.put("/rag-config", data);

export const resetRagConfig = () =>
  API.get("/rag-config/reset"); // GET method