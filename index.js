const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User:", socket.id);

  socket.on("join", (room) => {
    // выйти из всех комнат
    Object.keys(socket.rooms).forEach((r) => {
      if (r !== socket.id) socket.leave(r);
    });

    socket.join(room);
  });

  socket.on("message", (data) => {
    io.to(data.room).emit("message", data);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running 🚀"));
