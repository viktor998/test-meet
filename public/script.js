const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const thisUserVideo = document.createElement("video");
thisUserVideo.muted = true;

const peers = {};

const myPeer = new Peer(undefined, {
  host: "edu-meeting.herokuapp.com",
  port: 3001,
  secure: true,
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    addStream(thisUserVideo, stream);

    myPeer.on("call", (call) => {
      console.log("calling");
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userStream) => {
        addStream(video, userStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("User connected : " + userId);

      connectToUserStream(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function addStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

function connectToUserStream(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userStream) => {
    console.log("connect to stream");
    addStream(video, userStream);
  });

  call.on("close", () => {
    console.log("disconnect stream");
    video.remove();
  });

  peers[userId] = call;
}
