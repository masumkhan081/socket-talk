// abc
const express = require('express');
var expressLayouts = require('express-ejs-layouts');

const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
// 
const app = express();
const server = createServer(app);
const io = new Server(server);
// 
const { data, rooms } = require("./data/data")
// 
app.set('view engine', 'ejs');
// app.use(expressLayouts); 

app.get('/', function (req, res) {
      res.render('index', data)
});

function getRandomElement(array) {

      if (array.length === 0) {
            return undefined; // or handle the empty array case as needed
      }
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
}
const roomsArr = ['backend', 'frontend', 'fullstack'];

io.on('connection', (socket) => {


      const randomRoom = getRandomElement(roomsArr);
      socket.join(randomRoom);
      console.log("a user connected in room: " + randomRoom);
      // 
      io.sockets.in(randomRoom).emit("dev-talk", "group wise text. room no: " + randomRoom)

      // socket.on('dev-talk', (message, callback) => {
      //       console.log("data:  " + JSON.stringify(message));

      //       socket.on("disconnect", function () {
      //             console.log("a user disconnected ..."); 
      //       })

      //       const sender = data.users.filter((user) => user.uname === message.sender)
      //       socket.join(sender.groupName);
      //       io.to(sender.groupName).emit('dev-talk', { message: message.message, groupName: sender.groupName });

      //       console.log("sender: " + JSON.stringify(sender));

      //       callback({
      //             status: 'ok'
      //       });
      // });

      socket.onAny((eventName, ...args) => {
            // console.log("incoming - eventName:  " + eventName, " - ", args.length);
      });

      socket.onAnyOutgoing((eventName, ...args) => {
            // console.log("outgoing - eventName:  " + eventName, " - ", args.length);
      });
});

server.listen(3000, () => {
      console.log('server running at http://localhost:3000');
});
