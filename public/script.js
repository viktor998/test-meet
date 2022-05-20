const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const thisUserVideo = document.createElement("video");
thisUserVideo.muted = true;

const peers = {};

const myPeer = new Peer(undefined, {
  host: "/",
  port: 443,
  secure: true,
  config: {
    iceServers: [
      { url: "stun:stun01.sipphone.com" },
      { url: "stun:stun.ekiga.net" },
      { url: "stun:stun.fwdnet.net" },
      { url: "stun:stun.ideasip.com" },
      { url: "stun:stun.iptel.org" },
      { url: "stun:stun.rixtelecom.se" },
      { url: "stun:stun.schlund.de" },
      { url: "stun:stun.l.google.com:19302" },
      { url: "stun:stun1.l.google.com:19302" },
      { url: "stun:stun2.l.google.com:19302" },
      { url: "stun:stun3.l.google.com:19302" },
      { url: "stun:stun4.l.google.com:19302" },
      { url: "stun:stunserver.org" },
      { url: "stun:stun.softjoys.com" },
      { url: "stun:stun.voiparound.com" },
      { url: "stun:stun.voipbuster.com" },
      { url: "stun:stun.voipstunt.com" },
      { url: "stun:stun.voxgratia.org" },
      { url: "stun:stun.xten.com" },
      {
        url: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com",
      },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
    ],
  },
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
