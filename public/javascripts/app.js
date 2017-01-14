var app = angular.module('ChatApp', ['btford.socket-io', 'ngRoute']);
app.factory('socket', function (socketFactory) {
  return socketFactory();
});

app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "partials/html/main.html"
    })
    .when("/registration", {
        templateUrl: "partials/html/registration.html",
        controller: "RegistrationController",
        controllerAs: "my"
    })
    .when("/user/:key", {
        templateUrl: "partials/html/user.html",
        controller: "UserController",
        controllerAs: "my"
    })

});

var socket = io.connect('http://localhost:8080');
