"use strict";

//Load modules
var Room = require("./room.js");

var config = require("./../lib/config.js"); //Setup server


var express = require("express");

var socket = require("socket.io");

var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log("Listening on port ".concat(port));
}); //Setup io

var io = socket(server);
app.use(express["static"](__dirname + "/../client")); //Variables

var _lengthAuto = 0; //Things

var codes = [];
var rooms = []; //Functions

function getCode(length) {
  length = length || 4;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = "";

  function generateCode() {
    code = "";
    var len = _lengthAuto || length;

    for (var i = 0; i < len; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  generateCode();
  var start = Date.now();

  while (codes.includes(code)) {
    if (Date.now() - start > 20) {
      _lengthAuto = !_lengthAuto ? length + 1 : _lengthAuto + 1;
    }

    generateCode();
  }

  codes.push(code);
  return code;
}

function findRoomsByUserId(userId) {
  var _rooms = [];

  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    var user = room.users.find(function (u) {
      return u.id === userId;
    });

    if (user) {
      _rooms.push(room);
    }
  }

  return _rooms;
}

function findUserIdsByRoomCode(code) {
  var userIds = [];

  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];

    if (room.code === code) {
      for (var j = 0; j < room.users.length; j++) {
        var user = room.users[j];

        if (!userIds.includes(user.id)) {
          userIds.push(user.id);
        }
      }
    }
  }

  return userIds;
}

function sendServerMessage(roomCode, message, save) {
  var room = rooms.find(function (rm) {
    return rm.code === roomCode;
  });

  if (room) {
    var msg = {
      id: getCode(12),
      type: "server",
      username: "Server",
      timestamp: Date.now(),
      message: message
    };

    if (save) {
      room.addMessage(msg);
    }

    io["in"](room.code).emit("serverMessage", msg);
  }
}

io.on("connection", function (socket) {
  console.log("".concat(socket.id, " has connected."));
  socket.on("disconnect", function () {
    var userRooms = findRoomsByUserId(socket.id);

    for (var i = 0; i < userRooms.length; i++) {
      var room = userRooms[i];
      room.removeUser(socket.id);
      io["in"](room.code).emit("updateUsers", room.users);
      io["in"](room.code).emit("typingUsersUpdate", room.typingUsers);
    }
  });
  socket.on("userJoin", function (roomCode, userData) {
    userData = userData || {};
    if (!roomCode) roomCode = getCode();
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    }); //Create new room if the code is unique

    if (!room) {
      room = new Room(roomCode);
      rooms.push(room);
      socket.emit("autoCode", roomCode);
    } //Leave current rooms


    var _rooms = findRoomsByUserId(socket.id);

    for (var i = 0; i < _rooms.length; i++) {
      socket.leave(_rooms[i].code);
    } //Add user to room
    //First, check if the user is already in the room...


    var _user = room.getUser(socket.id);

    var user = _user;
    var isNewUser = false;

    if (!user) {
      //...if not, create a user instance
      user = {
        id: socket.id,
        name: userData.name,
        host: false,
        admin: false,
        pending: false
      };
      isNewUser = true;
    }

    console.log(room); //If the room is empty, the first person becomes the host

    if (!room.users.length) {
      user.host = true;
      user.admin = true;
      room.confirmUserId(socket.id);
    }

    if (room.options.locked) {
      if (!room.confirmedUsers.includes(user.id)) {
        user.pending = true;
      }
    } else {
      user.pending = false;
    }

    if (isNewUser) {
      room.addUser(user);
    }

    console.log("-------------USER:");
    console.log(user);
    console.log("......................................");
    socket.to(room.code).emit("updateUsers", room.users);
    socket.emit("updateRoom", room);

    if (!user.pending) {
      //Notify people in the room that there's a new user
      if (isNewUser) {
        sendServerMessage(room.code, "<@".concat(user.id, "> has joined."), true);
      }

      socket.join(room.code);
      socket.emit("updateUsers", room.users);
      socket.emit("updateMessages", room.messages);
    } else {
      socket.emit("updateRoomPending", room);
    }

    console.log(room);
  });
  socket.on("confirmUser", function (roomCode, userId) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });

    if (room) {
      var user = room.getUser(socket.id);

      if (user) {
        if (user.admin) {
          var pendingUser = room.getUser(userId);

          if (pendingUser) {
            pendingUser.pending = false;
            room.confirmUserId(pendingUser.id);
            io.to(pendingUser.id).emit("confirmedUser", room.code);
          }
        }
      }
    }
  });
  socket.on("reloadRoom", function (roomCode) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });

    if (room) {
      io["in"](room.code).emit("updateRoom", room);
      io["in"](room.code).emit("updateUsers", room.users);
      io["in"](room.code).emit("updateMessages", room.messages);
    }
  });
  socket.on("changeUsername", function (username) {
    var userRooms = findRoomsByUserId(socket.id);

    for (var i = 0; i < userRooms.length; i++) {
      var room = userRooms[i]; //Update users

      var user = room.users.find(function (u) {
        return u.id === socket.id;
      });

      if (user) {
        user.name = username;
        io["in"](room.code).emit("roomUsernameChange", user);
      } //Update messages username


      for (var j = 0; j < room.messages.length; j++) {
        var msg = room.messages[j];

        if (msg.userId === socket.id) {
          msg.username = user.name;
        }
      }
    }
  });
  socket.on("sendMessage", function (roomCode, msgData) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });
    console.log(roomCode, msgData);

    if (room) {
      var user = room.getUser(socket.id);
      msgData.id = getCode(12);
      room.addMessage(msgData);
      io["in"](room.code).emit("newMessage", msgData); //Check if the message is a command

      if (user) {
        if (user.host || user.admin) {
          var msgTrim = msgData.message.trim().toLowerCase();
          var serverMsg = {
            id: getCode(12),
            username: "Server",
            timestamp: Date.now(),
            message: "",
            type: "server"
          }; //Help

          if (msgTrim == "/help") {
            var helpMsg = "";
            var commands = Object.values(config.commands);

            for (var i = 0; i < commands.length; i++) {
              var command = commands[i];
              helpMsg += !command.alt ? command.cmd : command.alt;
              helpMsg += " - " + command.description; //Add line break

              if (i != commands.length - 1) {
                helpMsg += "\n\n";
              }
            }

            serverMsg.message = helpMsg;
            socket.emit("serverMessage", serverMsg);
          } //Lock room


          if (msgTrim == config.commands.lockRoom.cmd) {
            room.options.locked = true;
            sendServerMessage(room.code, "Room is now locked.", true);
          } //Unlock room


          if (msgTrim == config.commands.unlockRoom.cmd) {
            room.options.locked = false;
            sendServerMessage(room.code, "Room is now unlocked.", true);
            socket.emit("removeValidateButtons");

            for (var i = 0; i < room.users.length; i++) {
              var _user2 = room.users[i];

              if (_user2.pending) {
                _user2.pending = false;
                room.confirmUserId(_user2.id);
                io.to(_user2.id).emit("confirmedUser", room.code);
              }
            }
          } //Change room name


          if (msgTrim.startsWith(config.commands.changeRoomName.cmd)) {
            var newName = msgTrim.split(" ");
            newName.shift();
            newName = newName.join(" ");

            if (newName) {
              if (newName.length) {
                newName.trim();
                room.options.name = newName; //Notify

                sendServerMessage(room.code, "Room name is set to '" + newName + "'", true); //Change clients' room UI text

                var userIds = findUserIdsByRoomCode(room.code);

                for (var i = 0; i < userIds.length; i++) {
                  io.to(userIds[i]).emit("roomNameChange", room.code, room.options.name);
                }
              }
            }
          } //Change/Get room code


          if (user.host && msgTrim.startsWith(config.commands.changeRoomCode.cmd)) {
            var newCode = msgTrim.split(" ");
            newCode.shift();
            newCode = newCode.join(" ");

            if (newCode) {
              if (newCode.length) {
                if (room.code != newCode) {
                  //Check if the new code is unique
                  var roomCheck = rooms.find(function (rm) {
                    return rm.code === newCode;
                  });
                  var notUnique = false;

                  if (roomCheck) {
                    //If not, create another code
                    newCode = getCode();
                    notUnique = true;
                  } else {
                    codes.push(newCode);
                  } //Change room code for UI datas


                  var _userIds = findUserIdsByRoomCode(room.code);

                  for (var i = 0; i < _userIds.length; i++) {
                    io.to(_userIds[i]).emit("roomCodeChange", room.code, newCode);
                  } //Notify


                  serverMsg.message = "Room code is set to " + newCode;

                  if (notUnique) {
                    serverMsg.message = "The code you indicated isn't unique. Room code is set to " + newCode;
                  }

                  socket.emit("serverMessage", serverMsg);
                  room.code = newCode;
                } else {
                  serverMsg.message = "Room code is already set to " + newCode;
                  socket.emit("serverMessage", serverMsg);
                }
              }
            } else {
              serverMsg.message = "Room code is " + room.code;
              socket.emit("serverMessage", serverMsg);
            }
          }

          var mentions = msgData.mentions;

          if (mentions) {
            //Promote users
            if (msgTrim.startsWith(config.commands.promoteUser.cmd)) {
              for (var i = 0; i < mentions.length; i++) {
                var mentionId = mentions[i];
                var mentionedUser = room.getUser(mentionId);

                if (mentionedUser) {
                  if (!mentionedUser.admin && !mentionedUser.host) {
                    mentionedUser.admin = true;
                    sendServerMessage(room.code, "<@".concat(mentionedUser.id, "> has been promoted to Admin."), true);
                  }
                }
              }
            } //Demote users


            if (msgTrim.startsWith(config.commands.demoteUser.cmd)) {
              for (var i = 0; i < mentions.length; i++) {
                var _mentionId = mentions[i];

                var _mentionedUser = room.getUser(_mentionId);

                if (_mentionedUser) {
                  if (_mentionedUser.admin && !_mentionedUser.host) {
                    _mentionedUser.admin = false;
                    sendServerMessage(room.code, "<@".concat(_mentionedUser.id, "> has been demoted."), true);
                  }
                }
              }
            } //Kick users


            if (msgTrim.startsWith(config.commands.kickUser.cmd)) {
              for (var i = 0; i < mentions.length; i++) {
                var _mentionId2 = mentions[i];

                var _mentionedUser2 = room.getUser(_mentionId2);

                if (_mentionedUser2) {
                  if (!_mentionedUser2.admin && !_mentionedUser2.host) {
                    room.removeUser(_mentionedUser2.id);
                    io.to(_mentionedUser2.id).emit("clientKicked", room.code);
                    io["in"](room.code).emit("updateUsers", room.users); //Notify kicked user

                    serverMsg.message = "You have been kicked.";
                    io.to(_mentionedUser2.id).emit("serverMessage", serverMsg); //Notify everyone

                    sendServerMessage(room.code, "".concat(_mentionedUser2.name, " has been kicked."), true);
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  socket.on("joinNewCode", function (newCode, oldCode) {
    var room = rooms.find(function (rm) {
      return rm.code === newCode;
    });

    if (room) {
      socket.leave(oldCode);
      socket.join(newCode); //socket.emit("updateUsers", room.users);
      //socket.emit("updateMessages", room.messages);
    }
  });
  socket.on("userTyping", function (roomCode) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });

    if (room) {
      room.addTypingUserId(socket.id);
      io["in"](room.code).emit("typingUsersUpdate", room.typingUsers);
    }
  });
  socket.on("userAFK", function (roomCode) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });

    if (room) {
      room.removeTypingUser(socket.id);
      io["in"](room.code).emit("typingUsersUpdate", room.typingUsers);
    }
  });
  socket.on("leaveRoom", function (roomCode) {
    socket.leave(roomCode);
  });
  socket.on("uploadStart", function (uploadId, roomCode, msgData, metadata) {
    var room = rooms.find(function (rm) {
      return rm.code === roomCode;
    });

    if (room) {
      var file = room.createFile(metadata);
      var destroyed = false;
      socket.on("uploadDestroy" + uploadId, function () {
        destroyed = true;
        socket.emit("uploadFinish" + uploadId);
      });
      socket.emit("uploadNext" + uploadId, file.size);
      socket.on("uploadProgress" + uploadId, function (chunk) {
        if (destroyed) return;
        file.addChunk(chunk);

        if (file.size < file.metadata.size) {
          console.log("UPLOADING " + uploadId + "...");
          socket.emit("uploadNext" + uploadId, file.size);
        } else {
          console.log("UPLOADED " + uploadId + "!");
          var attachment = {
            buffer: new Uint8Array(file.buffer),
            metadata: metadata
          };
          msgData.id = getCode(12);
          msgData.attachment = attachment;
          msgData.timestamp = Date.now();
          room.addMessage(msgData);
          io["in"](room.code).emit("newFile", msgData);
          socket.emit("uploadFinish" + uploadId);
        }
      });
    }
  });
});