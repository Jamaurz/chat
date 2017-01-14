app.controller('MainController', ["socket", "$location", "userServices",   function(socket, $location, userServices) {
	vm = this;
	vm.serverMessage = [];
	vm.currentRoom = 'room1';
	vm.chatMessage = [];
	vm.roomsPrivate = [];

	vm.login = function() {
		userServices.login(vm.loginObj, function(result) {
			if(result != false) {				
				$('#myModal').modal('toggle');
				socket.emit('addUser', vm.loginObj.email);
				vm.currentUser = vm.loginObj.email;
			} else {
				vm.message = 'Email чи пароль неправильний';
			}
		});
	}

	vm.datasend = function() {
		if(vm.data) {
			socket.emit('sendChat', vm.data);
			vm.data = '';
		}
	}

	socket.on('updateChatMessage', function(username, data) {
        var msg = {};
        msg.username = username;
        msg.msg = data;
        vm.chatMessage.push(msg);
    });

	socket.on('connect', function() {
	    $('#myModal').modal('toggle');
	});

	socket.on('updateChat', function(username, msg) {
		var data = {}
		data.username = username;
		data.msg = msg;
    	vm.serverMessage.push({data});
    });

     socket.on('updateRooms', function(rooms, currentRoom, roomsPrivate, username) {
     	vm.rooms = rooms;
     	if(roomsPrivate.length > 0) {
     		vm.roomsPrivate = [];
	     	for(var i = 0; i < roomsPrivate.length; i++) {
	     		var obj= {};
	     		obj.nameChat = roomsPrivate[i].nameChat;
	     		if(roomsPrivate[i].users[0] == username) {
	     			obj.aliasChat = roomsPrivate[i].users[1]
	     		} else if(roomsPrivate[i].users[1] == username) {
	     			obj.aliasChat = roomsPrivate[i].users[0]
	     		}
	     		vm.roomsPrivate.push(obj);
	     	}
	    }
     });

     socket.on('updateRoomsBroadcast', function(room) {
        vm.rooms.push(room);
     });

     socket.on('updateRoomsFriend', function(nameRoom, aliasRoom) {
     	var obj = {};
     	obj.nameChat = nameRoom;
     	obj.aliasChat = aliasRoom;
     	vm.roomsPrivate.push(obj);
    });

     vm.addRoom = function() {
     	if(vm.nameRoom) {
	     	socket.emit('addRoom', vm.nameRoom);
	     	vm.nameRoom = '';
	    }
     }	

     vm.switchRoom = function(room, alias) {
     	if(alias) {
     		vm.currentRoom = alias;
     	}
     	socket.emit('switchRoom', room);
     }
     socket.on('updateUsers', function(usernames, currentUser) {
     	vm.users = usernames;
     });

     vm.addChat = function(friend) {
     	socket.emit('addChat', friend);
     }
}]);