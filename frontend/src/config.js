const socketUrl = import.meta.env.VITE_SOCKET_URL;
const mlApiUrl = import.meta.env.VITE_ML_API_URL;

export const SOCKET_URL =
  socketUrl !== undefined && socketUrl !== ""
    ? socketUrl
    : typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3001";

export const ML_API_URL =
  mlApiUrl !== undefined && mlApiUrl !== ""
    ? mlApiUrl
    : "http://127.0.0.1:5000";
