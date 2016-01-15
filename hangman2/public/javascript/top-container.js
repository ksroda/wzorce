$(document).ready(function() {
	$(".games, .log-button, #website-name").on('click', function() {
		window.location = $(this).find("a").attr("href"); 
		return false;
	});

	$("#profile").hover(function() {
		$("#phrase").stop().fadeOut(300);
	});

	$("#profile").mouseleave(function() {
		$("#phrase").stop().fadeIn(700);
	});

	$("#left-container").hover(function() {
		$("#submit-add").stop().fadeIn(500);
	});

	$("#left-container").mouseleave(function() {
		$("#submit-add").stop().fadeOut(500);
		$(".chat-window").stop().slideUp();
	});

	$("#submit-add").hide();


	$(document).on('click', ".chat-friend-button", function() {
		$(".chat-window").not($(this).attr("data-target")).stop().slideUp();
		$($(this).attr("data-target")).stop().slideDown();
		$($(this).attr("data-target")).find("input").focus();
		$(this).find(".got-message").hide();
	});
});

if(socket) {
	socket.on('message', function(data) {
		// console.log(data.from + "   " + data.to + "   " + data.content);
		$("#" + data.from + " .chat-friend .chat-friend-messages ul")
			.append("<li>" + data.content + "</li>");

		var d = $("#" + data.from + " .chat-friend .chat-friend-messages");
		d.scrollTop(d.prop("scrollHeight"));

		if(data.messageIcon) {
			$("button[data-target='#" + data.from  + "'] .got-message").show();
		}
	});

	socket.on('online', function(roomName) {
		var clients = roomName.split("_");
		$("#online" + clients[0] + ".online-status, #online" + clients[1] + ".online-status").show();
		// alert(roomName);
		// console.log(roomName +" just went online");
	});

	socket.on('offline', function(roomName) {
		var clients = roomName.split("_");
		$("#online" + clients[0] + ".online-status, #online" + clients[1] + ".online-status").hide();
		// console.log(roomName +" just went offline");
	});

	socket.on('update rooms', function(rooms) {
		var controller = angular.element($('#rooms')).scope();
		if(controller) {
			controller.update(rooms);
		}
	});

	socket.on('update', function(data) {
		if(gameLoaded) {
			subject.notify(data);
		}
	});
}