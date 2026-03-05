import { io } from "socket.io-client";
const socket = io("wss://socketsbay.com/wss/v2/1/demo/");
socket.on("connect", () => console.log("C"));
socket.on("connect_error", err => console.log(err));
