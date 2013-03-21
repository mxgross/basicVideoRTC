var server = require('http').createServer();
var app = server.listen(8080);
var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });
});