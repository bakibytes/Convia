import { Server } from "socket.io";

const connections = {};
const messages = {};

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", (socket) => {
    console.log("Something is connected")
    socket.on("join-call", (path) => {
      connections[path] ??= [];

      connections[path].push(socket.id);
      socket.data.callPath = path;

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path],
        );
      }

      if (messages[path] !== undefined) {
        for (const savedMessage of messages[path]) {
          io.to(socket.id).emit(
            "chat-message",
            savedMessage.data,
            savedMessage.sender,
            savedMessage["socket-id-sender"],
          );
        }
      }
    });

    socket.on("signal", (toId, signal) => {
      if (typeof toId !== "string" || !signal || typeof signal !== "object") return;
      if (!connections[socket.data.callPath]?.includes(toId)) return;

      io.to(toId).emit("signal", socket.id, signal);
    });


    //this function is used to send the message to all the members of a specific room in which the recipent has
    /**
     Ex:- Aaditya:- 
     assume aaditya is in room A:-
     lets assume sumit join the room then the message goes to aaditya saying that sumit joined this meeting
     and then sumit send the message to everyone and vica-versa
      */
    socket.on("chat-message", (data, sender) => {
      const callPath = socket.data.callPath;
      if (!callPath || !connections[callPath]?.includes(socket.id)) return;
      if (typeof data !== "string" || !data.trim()) return;

      messages[callPath] ??= [];
      const chatMessage = {
        sender: typeof sender === "string" ? sender : "Guest",
        data: data.trim(),
        "socket-id-sender": socket.id,
      };
      messages[callPath].push(chatMessage);

      connections[callPath].forEach((socketId) => {
        io.to(socketId).emit(
          "chat-message",
          chatMessage.data,
          chatMessage.sender,
          chatMessage["socket-id-sender"],
        );
      });
    });


    socket.on("disconnect", () => {
      const callPath = socket.data.callPath;
      if (!callPath || !connections[callPath]) return;

      connections[callPath].forEach((socketId) => {
        io.to(socketId).emit("user-left", socket.id);
      });
      connections[callPath] = connections[callPath].filter(
        (socketId) => socketId !== socket.id,
      );

      if (connections[callPath].length === 0) {
        delete connections[callPath];
      }
    });
    console.log("A user connected: " + socket.id);
  });
  return io;
};

export default connectToSocket;
