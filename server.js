import { Server } from "socket.io";
const io = new Server(3000, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});
console.log("Running on :3000");
