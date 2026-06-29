let io;

const getIO = () => io;

const setIO = (socketIO) => {
  io = socketIO;
};

const emitBookingEvent = (event, booking) => {
  if (!io) return;
  const adminRoom = "admin";
  const cityRoom = booking.city;

  io.to(adminRoom).emit(event, booking);
  if (cityRoom) {
    io.to(cityRoom).emit(event, booking);
  }
};

module.exports = { setIO, getIO, emitBookingEvent };
