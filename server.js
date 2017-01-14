var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var server = http.createServer(app);  
var uuid = require('node-uuid');
var mysql = require('mysql');

server.listen(8080);
var io = require('socket.io').listen(server);

var connection = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatio'
});

connection.connect();

var usernames = {};
var userID = {};
var rooms = ['room1', 'room2', 'room3'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index', { title: 'Home' });
});
app.post('/registrationUser', function(req, res) {
    var user = req.body;
    connection.query('select email from Users where email = ?', [user.email], function (err, rows, fields) {
        if(err) throw err;
        if(rows.length == 0) {
            connection.query("insert into users (firstName, lastName, email, pass, about) VALUES (?, ?, ?, ? , ?)", [user.firstName, user.lastName, user.email, user.password, user.about], function(err, result) {
                if (err) throw err;
                  res.send(true);
                }
            ); 
        } else {
            res.send(false);
        }   
    });
});
app.post('/loginUser', function(req, res) {
    connection.query('select email, pass from Users where email = ? && pass = ?', [req.body.email, req.body.pass], function (err, rows, fields) {
        if(err) throw err;  
        (rows.length) ? res.send(true) : res.send(false);
    });
});

app.post('/info', function(req, res) {
    var id = req.body.id;
    console.log(req.body);
    connection.query("select id,firstName, lastName, email, about from Users where id=? ", [id], function(err, rows, fields) {
        if(err) throw err;
        console.log("rows", rows);
        res.send(rows);
    })

});

app.post('/updateInfo', function(req, res) {
    console.log(req.body);
    var user = req.body;
    var userUP = [user.firstName, user.lastName, user.about, user.id];

    connection.query('update Users set  firstName=?, lastName=?, about=? where id=?', userUP, function(err, rows, fields) {
        res.send("Updated")
    });
});


io.sockets.on('connection', function(socket) {
  //Everything we do in here is related to socket connections
  //socket is the user, we can communicate with it from here.
    socket.on('addUser', function(username){
      //When the client emits an add user, we perform that functionality
        socket.username = username;
        console.log(username + " Connected");  
        getRooms(function(data){
            //tell the user to join the default room
            socket.room = data[0];
            //save the user
            usernames[username] = username;
            userID[username] = socket.id;
            //physically join the player and it's socket to the room
            socket.join(socket.room);
          
            //emit, to the client, you've connected
            updateClient(socket, username, socket.room);

            //emit to the room, a person has connected
            //socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', username + ' has connected');
            //updateChatRoom(socket, 'connected');
            updateRoomList(socket, socket.room);
            //update users list
            io.sockets.emit('updateUsers', usernames);
        });      
    });
    //take in the message, emit it
    socket.on('sendChat', function (data) {
        //send the message to everyone
        console.log(socket.username + " sent a message");
        io.sockets.in(socket.room).emit('updateChatMessage', socket.username, data);
    });
    //when we switch a room
    socket.on('switchRoom', function(newRoom) {
        socket.leave(socket.room);
        socket.join(newRoom);
        //update client
        updateClient(socket, socket.username, newRoom);
        //update old room
        //updateChatRoom(socket, 'left this room');
        //change room
        socket.room = newRoom;
        //update new room
        //updateChatRoom(socket, 'connected');
        updateRoomList(socket, socket.room);
    });
    socket.on('addRoom', function(newRoom) {
        //update client
        updateClient(socket, socket.username, newRoom);
        //add room
        connection.query('insert into rooms (nameChat) values (?)', [newRoom], function(err, result) {
            if(err) throw err;
            updateRoomList(socket, newRoom);
            socket.broadcast.emit('updateRoomsBroadcast', newRoom);
        })
    });
    //add private chat
    socket.on('addChat', function(friend) {
      var nameChat = uuid.v4();
      connection.query('insert into chat (user1, user2, nameChat) values (?,?,?)', [socket.username, friend, nameChat], function(err, result) {
        if(err) throw err;
        console.log(result);
        updateRoomList(socket, socket.room);
        updateRoomListFriend(friend, nameChat, socket.username);
      });    
    });

    //disconnecting from a room
    socket.on('disconnect', function() {
        // remove the user from global list
        delete usernames[socket.username];
        delete userID[socket.username];
        //tell everyone\
        updateGlobal(socket, 'disonnected');
        //leave channel
        socket.leave(socket.room);
        // tell the user list on the client side
        io.sockets.emit('updateUsers', usernames);
    })


});
//update single client with this.
function updateClient(socket, username, newRoom) {
    socket.emit('updateChat', 'SERVER', 'You\'ve connected to '+ newRoom);
}

function updateRoomList(socket, currentRoom) {
    getRooms(function(rooms) {
        connection.query('select user1, user2, nameChat from chat where user1 = ? OR user2 = ?', [socket.username, socket.username], function(err, rows) {
            if(err) throw err;
                socket.emit('updateRooms', rooms, currentRoom, rows, socket.username);
            });
        });
    }
function updateRoomListFriend(friend, nameRoom, aliasRoom) {
  io.sockets.in(userID[friend]).emit('updateRoomsFriend', nameRoom, aliasRoom);
}

//We will use this function to update the chatroom when a user joins or leaves
function updateChatRoom(socket, message) {
    socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username + ' has ' + message);
}
//We will use this function to update everyone!
function updateGlobal(socket, message) {
    socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has ' + message);
}

function getRooms(callback) {
    connection.query('select nameChat from rooms', function(err, rows, fields) {
        if(err) throw err;
        callback(rows);
    });
}