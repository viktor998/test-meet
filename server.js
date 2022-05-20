/* The above code is creating a server that listens on port 3000. */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

var ExpressPeerServer = require("peer").ExpressPeerServer;
var options = {
  debug: true,
  allow_discovery: true,
};
let peerServer = ExpressPeerServer(server, options);
app.use("/peerjs", peerServer);

/*  */
app.set("view engine", "ejs");
app.use(express.static("public"));

// let userId;

// app.get("/:room/:user", (req, res) => {
//   userId = req.params.user;
//   let roomId = req.params.room;
//   res.redirect(`/${roomId}`);

//   console.log(req.params);
// });

app.get("/:room", (req, res) => {
  console.log(req.params);
  res.render("room", {
    roomId: req.params.room,
  });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 5000);
