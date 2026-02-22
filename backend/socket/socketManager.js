let io;

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join expert-specific room for real-time slot updates
    socket.on('joinExpertRoom', (expertId) => {
      socket.join(`expert:${expertId}`);
      console.log(`👤 Socket ${socket.id} joined expert:${expertId}`);
    });

    socket.on('leaveExpertRoom', (expertId) => {
      socket.leave(`expert:${expertId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIo };
