app.controller('RegistrationController', ['userServices', function(userServices) {
		vr = this;
		vr.registration = function() {
			userServices.registration(vr.registObj, function(message) {
				if(message) {
					vr.message = 'Реєстрація відбулась успішно';
					$('#myModal').modal('toggle');
				} else {
					vr.message = 'Реєстрація не відбулась. Такий емейл вже використаний.';
				}
			});
		vr.registObj = {};
	}
}])