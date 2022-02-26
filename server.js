const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const app = express();

const port = 4000;

const server = http.createServer(app);
const io = socketIo(server);

let broadcaster

io.sockets.on("error", e => {
    console.error(e);
});

io.sockets.on("connection", socket => {
    console.log("connection....")
    socket.on("broadcaster", (context) => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster", context);
    });
    socket.on("watcher", () => {
        console.log("watcher", socket.id)
        socket.to(broadcaster).emit("watcher", socket.id);
    });
    socket.on("offer", (id, message, context) => {
        socket.to(id).emit("offer", socket.id, message, context);
    });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("disconnect", () => {
        socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });
});

app.use(express.static(__dirname + "/build"));

server.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports ={
    port
}