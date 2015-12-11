var socket = io();
if(!user.guest) {
	socket.emit('login', user.name);
}

$(document).ready(function(){
	$("#blackjack").hover(function() {
		$("#top-container").css("background", "#b30000");
		$("#left-container").css("background", "#b30000");
		$("body").css("background", "black");
		$("#charades").css("opacity", "0.1");
		$("#hangman").css("opacity", "0.1");
	});

	$("#hangman").hover(function() {
		$("#top-container").css("background", "#63471c");
		$("#left-container").css("background", "#63471c");
		$("body").css("background", "#F8B346");
		$("#blackjack").css("opacity", "0.1");
		$("#charades").css("opacity", "0.1");
	});

	$("#charades").hover(function() {
		$("#top-container").css("background", "#1d3643");
		$("#left-container").css("background", "#1d3643");
		$("body").css("background", "#4a87a8");
		$("#blackjack").css("opacity", "0.1");
		$("#hangman").css("opacity", "0.1");
	});

	$(".games").mouseout(function() {
		$("#top-container").css("background", "#222222");
		$("#left-container").css("background", "#222222");
		$("body").css("background", "#333333");
		$("#charades").css("opacity", "1");
		$("#blackjack").css("opacity", "1");
		$("#hangman").css("opacity", "1");
	});
});