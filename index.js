const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Чат сервер работает 🚀");
});

io.on("connection", (socket) => {
  console.log("Пользователь подключился");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Пользователь вышел");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
