import { io } from "socket.io-client";

const socketLink = process.env.REACT_APP_APILINK ? process.env.REACT_APP_APILINK.replace('/api', '') : "http://localhost:4000";
const socket = io(socketLink, {
  autoConnect: true,
});

export default socket;
