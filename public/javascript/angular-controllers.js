var app = angular.module('myApp', []);
app.controller('friendsCtrl', ["$scope", "$http", function($scope, $http) {
	$http.get("/friends?who=" + user.name).success(function(response) {
		$scope.friends = response;
	});
					
	$scope.update = function() {
		$http.get("/friends?who=" + user.name).success(function(response) {
			$scope.friends = response;
		});
	}
}]);

app.controller('customersCtrl', ["$scope", "$http", function($scope, $http) {
	$http.get("/blackjack/rooms").success(function(response) {
		$scope.rooms = response;
	});
					
	$scope.update = function(rooms) {
		$scope.$apply(function() {
			$scope.rooms = rooms;
		});
	}
}]);