app.controller('friendsController', ["$scope", "$http", "$location", "$timeout", function($scope, $http, $location, $timeout) {
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
		$http.get("/addfriend?who=" + user.name + "&friend=" + $scope.friendName).success(function(response) {
			$scope.friends = response.friends;
			if(response.success) {
				$scope.returnMessageSuccess = response.message;
				$scope.returnMessageShowSuccess = true;
				$timeout(function() {
					$scope.returnMessageShowSuccess = false;
				}, 3000);
			} else {
				$scope.returnMessageDanger = response.message;
				$scope.returnMessageShowDanger = true;
				$timeout(function() {
					$scope.returnMessageShowDanger = false;
				}, 3000);
			}
		});
		
		$scope.friendName = "";
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
		if($scope.rooms.length === 0) {
			$scope.noRooms = true;
		} else {
			$scope.noRooms = false;
		}
	});

	$scope.update = function(rooms) {
		$scope.$apply(function() {
			$scope.rooms = rooms;
			if($scope.rooms.length === 0) {
				$scope.noRooms = true;
			} else {
				$scope.noRooms = false;
			}
		});
	}

	$scope.enterRoom = function(room) {
		userAllowedToEnterGame = true;
		sendWelcome(room);
		$location.path("/game");
	}

	$scope.createRoom = function() {
		if($scope.roomEntered != undefined) {
			userAllowedToEnterGame = true;
			sendWelcome($scope.roomEntered);
			$location.path("/game");
		}
	}
}]);

		