const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const {
  generateMessage,
  generateLocationMessage,
} = require("./util/message.js");

io.on("connection", (socket) => {
  socket.emit("newMessage", generateMessage("Admin", "Welcome to our chat"));
  socket.broadcast.emit(
    "newMessage",
    generateMessage("Admin", "New User Joined!")
  );

  socket.on("createMessage", (message) => {
    socket.broadcast.emit(
      "newMessage",
      generateMessage(message.from, message.text)
    );
  });

  socket.on("locationMessage", (locationMessage) => {
    const locationUrl = generateLocationMessage(
      "User",
      locationMessage.lat,
      locationMessage.lng
    );
    socket.emit("locationUrl", locationUrl);
  });

  //   socket.on('disconnect', () => {
  //     console.log('User was disconnected')
  //   })
});
