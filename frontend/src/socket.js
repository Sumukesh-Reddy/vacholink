import { io } from "socket.io-client";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const socket = io(`${API_URL}`, {
  transports: ["websocket", "polling"],
  auth: {
    token: localStorage.getItem('token')
  }
});