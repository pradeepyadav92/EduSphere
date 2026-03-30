import { io } from "socket.io-client";

const envBaseUrl = process.env.REACT_APP_BASE_URL?.trim();
const socketLink = envBaseUrl
  ? envBaseUrl.replace(/\/api\/?$/, "")
  : (typeof window !== "undefined" ? window.location.origin : undefined);

const socket = io(socketLink, {
  autoConnect: true,
});

export default socket;
