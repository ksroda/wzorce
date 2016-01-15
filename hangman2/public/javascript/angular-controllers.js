app.controller('friendsController', ["$scope", "$http", "$location", function($scope, $http, $location) {
	$http.get("/friends?who=" + user.name).success(function(response) {
		$scope.friends = response;
		socket.emit('join me to friends chats', {
				name: user.name,
				friends: response
			});
	});	

	$scope.updateFriends = function() {
		$http.get("/friends?who=" + user.name).success(function(response) {
			$scope.friends = response;
			socket.emit('join me to friends chats', {
				name: user.name,
				friends: response
			});
		});
	}

	$scope.addFriend = function() {
		// console.log(user.name);
		socket.emit('add friend', {
			user: user.name,
			friend: $scope.friendName
		});
		$scope.updateFriends();
	}

	$scope.keyPressed = function($event, name, inputId) {
		var keyCode = $event.which || $event.keyCode;
	    if (keyCode === 13) {
	        // alert(user.name + "   " + name + "  " + $("#" + inputId).val() + "   " + inputId);
	        socket.emit("message", {
	        	from: user.name,
	        	to: name,
	        	content: $("#" + inputId).val()
	        });

	        $(".chat-friend-input-input").val("");
	        $("#" + name).find(".got-message").hide();
	    }
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

		