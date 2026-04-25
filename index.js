const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("joinRoom", ({ room, user }) => {
    socket.join(room);
    socket.room = room;
    socket.user = user;

    io.to(room).emit("message", {
      user: "Система",
      text: `${user} вошёл в чат`,
    });
  });

  socket.on("chatMessage", (msg) => {
    io.to(socket.room).emit("message", {
      user: socket.user,
      text: msg,
    });
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      io.to(socket.room).emit("message", {
        user: "Система",
        text: `${socket.user} вышел`,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running 🚀"));
