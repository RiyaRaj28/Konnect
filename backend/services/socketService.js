const socketIo = require('socket.io');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Replace with your frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinBooking', (bookingId) => {
      socket.join(bookingId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

function emitDriverLocation(bookingId, location) {
  if (io) {
    console.log('Emitting driver location updateee:', location);
    io.to(bookingId.toString()).emit('driverLocationUpdate', location);
  }
}

module.exports = { initializeSocket, emitDriverLocation };
