app.factory('userServices', function($http) {
	var obj = {
		registration: function(user, callback) {
			$http.post('/registrationUser', user).then(function(res) {
				callback(res.data);
			});
		},
		login: function(user, callback) {
			$http.post('/loginUser', user).then(function(res) {
				callback(res.data);
			});
		},
		info: function(user, callback) {
			$http.post('/info', user).then(function(res) {
				callback(res.data);
			})
		},
		update: function(user) {
			$http.post('/updateInfo', user);
		},
		chat: function(users) {
			$http.post('/remChat', users);
		}
	}

	return obj;
})