app.controller('friendsController', ["$scope", "$http", "$location", function($scope, $http, $location) {
	$http.get("/friends?who=" + user.name).success(function(response) {
		$scope.friends = response;
	});	

	$scope.updateFriends = function() {
		$http.get("/friends?who=" + user.name).success(function(response) {
			$scope.friends = response;
		});
	}

	$scope.addFriend = function() {
		console.log(user.name);
		socket.emit('add friend', {
			user: user.name,
			friend: $scope.friendName
		});
		$scope.updateFriends();
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
		userAllowedToEnterGame = true;
		sendWelcome(room);
		$location.path("/game");
	}

	$scope.createRoom = function() {
		userAllowedToEnterGame = true;
		sendWelcome($scope.roomEntered);
		$location.path("/game");
	}
}]);

		