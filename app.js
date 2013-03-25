var server = require('http').createServer();
var app = server.listen(8080);
var io = require('socket.io').listen(app);
var userCounter = 0;

io.sockets.on('connection', function(socket) {
    console.log ( (new Date ()) + ' Connection established.' );

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
        console.log("Message: " + message.type);
    });

});