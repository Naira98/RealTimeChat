import { io } from "socket.io-client";
import moment from "moment";

const messageDisplay = document.querySelector(".chat__messages");
const messageInput = document.querySelector("input");
const sendBtn = document.querySelector("#submit-btn");
const locationBtn = document.querySelector("#send-location");
const form = document.querySelector("form");

function scrollTobottom() {
  const lastMessage = document.querySelector("#messages").lastElementChild;
  lastMessage.scrollIntoView();
}

const socket = io("http://localhost:3000");
// Get name and room
socket.on("connect", () => {
  let paramsString = window.location.search.substring(1);
  let paramsObject = {};
  const queries = paramsString.split("&");

  for (let i = 0; i < queries.length; i++) {
    const keyValuePairs = queries[i].replaceAll("+", " ").split("=");
    for (let j = 0; j < keyValuePairs.length; j++) {
      paramsObject[keyValuePairs[0]] = keyValuePairs[1];
    }
  }

  // Send name and room to backend to join
  socket.emit("join", paramsObject, (err) => {
    if (err) {
      alert(err);
      window.location.href = "/";
    }
  });
  // paramsObject.(qureies[0].split('=')[0] = qureies[0].split('=')[1];
  // console.log(paramsObject);
  // console.log(JSON.stringify('{"' + decodeURI(params).replace('=', '":"').replace('+', ' ').replace('&', '","').replace('=', '":"')+ '"}'))
});

// Someone entered the room
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
  // displayMessage(message);
});

sendBtn.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    // if (message !== "") {
    // const formatedTime = moment(message.createdAt).format("LT");
    // const template = document.querySelector("#message").innerHTML;
    // const html = Mustache.render(template, {
    //   from: "User",
    //   text: messageInput.value,
    //   createdAt: formatedTime,
    // });
    // const div = document.createElement("div");
    // div.innerHTML = html;
    // messageDisplay.appendChild(div);

    // Send my message to the server
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
  // }
);

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



function displayMessage(message) {
  const div = document.createElement("div");
  const formatedTime = moment(message.createdAt).format("LT");
  div.textContent = `${message.from} ${formatedTime}: ${message.text}`;
  messageDisplay.appendChild(div);
}
