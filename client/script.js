import { io } from "socket.io-client";
import moment from "moment";

const messageDisplay = document.querySelector(".chat__messages");
const messageInput = document.querySelector("input");
const sendBtn = document.querySelector("#submit-btn");
const locationBtn = document.querySelector("#send-location");
const form = document.querySelector("form");

document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:3000");
  socket.on("connect", () => {
    console.log(`you conncted with id: ${socket.id}`);
  });

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
    // displayMessage(message);
  });

  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // const message = { from: "User", text: messageInput.value };
    if (message !== "") {
      const formatedTime = moment(message.createdAt).format("LT");
      const template = document.querySelector("#message").innerHTML;
      const html = Mustache.render(template, {
        from: "User",
        text: messageInput.value,
        createdAt: formatedTime,
      });
      const div = document.createElement("div");
      div.innerHTML = html;
      messageDisplay.appendChild(div);
      // displayMessage(message);
      socket.emit("createMessage", message);
      messageInput.value = "";
    }
  });

  socket.on("locationUrl", (urlMessage) => {
    const formatedTime = moment(urlMessage.createdAt).format("LT");
    const template = document.querySelector("#location-message").innerHTML;
    const html = Mustache.render(template, {
      from: urlMessage.from,
      url: urlMessage.url,
      createdAt: formatedTime,
    });
    const div = document.createElement('div');
    div.innerHTML = html;
    messageDisplay.appendChild(div);
  });

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
      },
      () => {
        return alert("Unable to fetch poistion");
      }
    );
  });

  function displayMessage(message) {
    const div = document.createElement("div");
    const formatedTime = moment(message.createdAt).format("LT");
    div.textContent = `${message.from} ${formatedTime}: ${message.text}`;
    messageDisplay.appendChild(div);
  }
});
