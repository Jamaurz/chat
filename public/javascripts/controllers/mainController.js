app.controller('MainController', ["socket", "$location", "userServices",   function(socket, $location, userServices) {
	vm = this;
	vm.serverMessage = [];
	vm.currentRoom = 'room1';
	vm.chatMessage = [];

	vm.login = function() {
		userServices.login(vm.loginObj, function(result) {
			if(result != false) {				
				$('#myModal').modal('toggle');
				socket.emit('addUser', vm.loginObj.email);
			} else {
				vm.message = 'Email чи пароль неправильний';
			}
		});
	}

	vm.datasend = function() {
		socket.emit('sendChat', vm.data);
		vm.data = '';
	}

	socket.on('updateChatMessage', function(username, data) {
        var msg = {};
        msg.username = username;
        msg.msg = data;
        console.log(msg);
        vm.chatMessage.push(msg);
        console.log(vm.chatMessage);
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
     });	

     vm.switchRoom = function(room) {
     	vm.currentRoom = room;
     	socket.emit('switchRoom', room);
     }
     socket.on('updateUsers', function(usernames, currentUser) {
     	vm.users = usernames;
     });
}]);