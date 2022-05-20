/* The above code is creating a server that listens on port 3000. */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

/*  */
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

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
