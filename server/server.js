const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/message.js");
const { isString } = require("./utils/isString.js");

io.on("connection", (socket) => {
  

  socket.on("join", (params, cb) => {
    console.log(params);

    if (!isString(params.name) || !isString(params.room)) {
      return cb('Name and Room are requied')
    }
    socket.join(params.room)
    socket.emit("newMessage", generateMessage("Admin", `Welcome to ${params.room} Chat`));
    socket.broadcast.to(params.room).emit("newMessage", generateMessage("Admin", "New User Joined!"));


  });

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
