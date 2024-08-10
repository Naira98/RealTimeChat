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
const { Users } = require("./utils/users.js");

let users = new Users();

io.on("connection", (socket) => {
  // Join group chat
  socket.on("join", ({ name, room }, cb) => {
    if (!isString(name) || !isString(room)) {
      return cb("Name and Room are requied");
    }

    socket.join(room);
    users.removeUser(socket.id);
    users.addUser(socket.id, name, room);
    io.to(room).emit("updatedList", users.getUsersList(room));

    // Welcoming message
    socket.emit(
      "newMessage",
      generateMessage("Admin", `Welcome to ${room} Chat`)
    );

    // New User joined
    socket.broadcast
      .to(room)
      .emit("newMessage", generateMessage("Admin", `${name} Joined!`));
  });

  // New message from me
  socket.on("createMessage", (message, cb) => {
    const user = users.getUser(socket.id);

    // send my message to myself and other users in the room
    if (user) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
      cb();
    }
  });

  socket.on("locationMessage", (locationMessage, cb) => {
    if (!locationMessage) cb();
    let user = users.getUser(socket.id);
    const locationUrl = generateLocationMessage(
      user.name,
      locationMessage.lat,
      locationMessage.lng
    );
    io.to(user.room).emit("locationUrl", locationUrl);
  });

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updatedList", users.getUsersList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Admin", `${user.name} has left ${user.room} chat room`)
      );
    }
  });
});
