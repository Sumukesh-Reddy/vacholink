import { io } from "socket.io-client";

export const socket = io(`${"https://vacholink.onrender.com" || "http://localhost:3001"}`, {
  transports: ["websocket", "polling"],
  auth: {
    token: localStorage.getItem('token')
  }
});