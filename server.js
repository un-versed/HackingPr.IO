// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var logger = require('winston');
var port = process.env.PORT || 3000;
var users = {};

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
    //Limpa Socket do Usuário
    socket.leave(socket.id);
    console.log('connection' + socket.id)
    socket.on('login', function (data) {
        console.log('user_login' + data.user_ip)
        io.sockets.connected['/#' + data.sid].user_ip = data.user_ip;
        io.sockets.connected['/#' + data.sid].user_nick = data.user_nick;
        console.log(io.sockets.connected['/#' + data.sid].user_ip)
        io.sockets.connected['/#' + data.sid].join(data.user_ip);
    });

    socket.on('new:msg', function (data) {
        io.sockets.in(data.receiver_ip).emit('new:msg', data.sender_ip, data.msg);
    });

    socket.on('new:room:msg', function (room, msg) {
        io.sockets.in(room).emit('new:msg', socket.user_nick, msg);
    });

    socket.on('left:room', function (room) {
        io.sockets.connected[socket.id].leave(room);
        io.sockets.in(room).emit('left:room', socket.user_nick);
    });

    socket.on('join:room', function (room) {
        io.sockets.connected[socket.id].join(room);
        io.sockets.in(room).emit('new:usr:room', socket.user_nick);
    });

    socket.on('get:problem', function(data){
        socket.emit('problem:response', generateProblem(data.trj_lvl));
    });

});

// Functions 
function generateProblem(level) {
    //0 = + , 1 = - , 2 = * Math.floor((Math.random() * 100) + 1);
    var a,
        b,
        opArray = [0, 1, 2],
        operator = opArray[Math.floor(Math.random() * opArray.length)],
        subA,
        subB,
        adA,
        adB,
        multA,
        multB;

    if (level <= 10) {
        subA = 100;
        subB = 10;
        adA = 100;
        adB = 10;
        multA = 10;
        multB = 10;
    } else if (level <= 20 && level > 10) {
        subA = 100;
        subB = 100;
        adA = 100;
        adB = 100;
        multA = 10;
        multB = 20;
    } else if (level <= 30 && level > 20) {
        subA = 1000;
        subB = 100;
        adA = 1000;
        adB = 100;
        multA = 10;
        multB = 30;
    } else if (level <= 40 && level > 30) {
        subA = 1000;
        subB = 1000;
        adA = 1000;
        adB = 1000;
        multA = 20;
        multB = 30;
    }

    if (operator == 0) {
        a = Math.floor((Math.random() * adA) + 1);
        b = Math.floor((Math.random() * adB) + 1);

        return {
            result: a + b,
            problem: a + ' + ' + b + ' = ?'
        };
    } else if (operator == 1) {
        a = Math.floor((Math.random() * subA) + 1);
        b = Math.floor((Math.random() * subB) + 1);

        return {
            result: a - b,
            problem: a + ' - ' + b + ' = ?'
        };
    } else if (operator == 2) {
        a = Math.floor((Math.random() * multA) + 1);
        b = Math.floor((Math.random() * multB) + 1);

        return {
            result: a * b,
            problem: a + ' * ' + b + ' = ?'
        };
    }
}