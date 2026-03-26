import { io } from "socket.io-client";

const socketLink = process.env.REACT_APP_BASE_URL 
  ? process.env.REACT_APP_BASE_URL.replace('/api/', '').replace('/api', '') 
  : "http://localhost:4000";
const socket = io(socketLink, {
  autoConnect: true,
});

export default socket;
