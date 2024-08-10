import { io } from "socket.io-client";
import moment from "moment";

const messageDisplay = document.querySelector(".chat__messages");
const messageInput = document.querySelector("input");
const sendBtn = document.querySelector("#submit-btn");
const locationBtn = document.querySelector("#send-location");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  // Get name and room
  const { name, room } = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  // Send name and room to backend to join
  socket.emit("join", { name, room }, (err) => {
    if (err) {
      alert(err);
      window.location.href = "/";
    }
  });
});

// Someone entered or leave the room
socket.on("updatedList", (updatedList) => {
  const ol = document.createElement("ol");
  updatedList.map((user) => {
    const li = document.createElement("li");
    li.innerHTML = user;
    ol.appendChild(li);
  });
  const usersList = document.querySelector("#users");
  usersList.innerHTML = "";
  usersList.appendChild(ol);
});

// Welcoming, new user joined, someone else message
socket.on("newMessage", (message) => {
  const formatedTime = moment(message.createdAt).format("LT");
  const template = document.querySelector("#message").innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formatedTime,
  });
  const div = document.createElement("div");
  div.innerHTML = html;
  messageDisplay.appendChild(div);
  scrollTobottom();
});

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Send my message to the server
  if (messageInput.value.trim() !== "") {
    socket.emit(
      "createMessage",
      {
        text: messageInput.value,
      },
      () => {
        messageInput.value = "";
      }
    );
    scrollTobottom();
  }
});

// Press send location button
locationBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert("Can't use geolocation on your browser");
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit("locationMessage", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      scrollTobottom();
    },
    () => {
      return alert("Unable to fetch poistion");
    }
  );
});

// url return from server
socket.on("locationUrl", (urlMessage) => {
  const formatedTime = moment(urlMessage.createdAt).format("LT");
  const template = document.querySelector("#location-message").innerHTML;
  const html = Mustache.render(template, {
    from: urlMessage.from,
    url: urlMessage.url,
    createdAt: formatedTime,
  });
  const div = document.createElement("div");
  div.innerHTML = html;
  messageDisplay.appendChild(div);
  scrollTobottom();
});

function scrollTobottom() {
  const lastMessage = document.querySelector("#messages").lastElementChild;
  lastMessage.scrollIntoView();
}
