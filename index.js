const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  fs.readFile('index.html', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

// комнаты с историей
const rooms = {};

function getRoom(name) {
  if (!rooms[name]) {
    rooms[name] = {
      clients: new Set(),
      history: []
    };
  }
  return rooms[name];
}

function broadcast(roomName, payload) {
  const room = getRoom(roomName);
  room.history.push(payload);
  if (room.history.length > 100) room.history.shift();

  room.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }

    // вход в комнату
    if (data.type === 'join') {
      ws.room = data.room;
      ws.user = data.user || 'Сотрудник';
      ws.role = data.role || 'staff';

      const room = getRoom(ws.room);
      room.clients.add(ws);

      // отправляем историю
      room.history.forEach(m => ws.send(JSON.stringify(m)));

      // уведомление о входе
      broadcast(ws.room, {
        type: 'system',
        text: `${ws.user} (${ws.role}) подключился`,
        time: new Date().toLocaleTimeString()
      });

      return;
    }

    // обычное сообщение
    if (data.type === 'message') {
      if (!ws.room) return;

      broadcast(ws.room, {
        type: 'message',
        user: ws.user,
        role: ws.role,
        text: data.text,
        time: new Date().toLocaleTimeString()
      });
    }

    // отчёт
    if (data.type === 'report') {
      if (!ws.room) return;

      broadcast(ws.room, {
        type: 'report',
        user: ws.user,
        role: ws.role,
        reportType: data.reportType,
        payload: data.payload,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].clients.delete(ws);
    }
  });
});

server.listen(port, () => {
  console.log('Server running 🚀');
});
