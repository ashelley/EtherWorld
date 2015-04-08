var fs = require('fs');
var path = require('path');

var Lobby = require('./../lib/lobby');
var storage = require('./../lib/storage');
var utils = require('./../lib/utils');

// Socket.io mapping.
var sockets = {};

// Webserver.
var express = require('express');
var morgan = require('morgan');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// voxel server
var voxelServer = require('./voxel-server')({ server: server });

const NODE_ENV = process.env.NODE_ENVIRONMENT || 'development';

const ROOT_DIR = path.normalize(__dirname + '/../..');
const BUILD_DIR = ROOT_DIR + '/build';
const CLIENT_DIR = ROOT_DIR + '/src/client';

// Routes that should render `/index.html` and get routed on the client.
const SPA_ROUTES = [
  '/room/:room'
];

app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/js/', express.static(BUILD_DIR + '/js'));
app.use('/css/', express.static(BUILD_DIR + '/css'));
app.use(express.static(CLIENT_DIR));

io.on('connection', function (socket) {
  console.log('got connection');
  sockets[socket.id] = socket;

  socket.on('disconnect', function () {
    delete sockets[socket.id];
  });

  socket.on('move', function (data) {
  });
});


var lobby = new Lobby();

function logRooms() {
  // For debugging.
  var rooms = lobby.getRooms();
  console.log('open rooms: %s', rooms.length ? rooms.join(', ') : '[none]');
}

logRooms();

app.get('/room/:room?', function (req, res, next) {
  var roomName = req.params.room;

  if (!roomName) {
    res.redirect('/room/' + utils.randomString());
    return;
  }

  lobby.addRoom(roomName);
  logRooms();

  next();
});



SPA_ROUTES.forEach(function (route) {
  app.get(route, function (req, res) {
    res.sendFile(CLIENT_DIR + '/index.html');
  })
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});