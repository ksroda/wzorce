app.controller('friendsController', ["$scope", "$http", "$location", function($scope, $http, $location) {
	$http.get("/friends?who=" + user.name).success(function(response) {
		$scope.friends = response;
	});	

	$scope.updateFriends = function() {
		$http.get("/friends?who=" + user.name).success(function(response) {
			$scope.friends = response;
		});
	}
}]);

app.controller('roomsController', ["$scope", "$http", "$location", function($scope, $http, $location) {
	$http.get(gameName + "/rooms").success(function(response) {
		$scope.rooms = response;
	});

	$scope.update = function(rooms) {
		$scope.$apply(function() {
			$scope.rooms = rooms;
		});
	}

	$scope.enterRoom = function(room) {
		sendWelcome(room);
		$location.path("/game");
	}

	$scope.createRoom = function() {
		sendWelcome($scope.roomEntered);
		$location.path("/game");
	}
}]);

		