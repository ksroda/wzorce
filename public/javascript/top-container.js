$(document).ready(function() {
	$(".games, .log-button").on('click', function() {
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
	});

	$("#submit-add").hide();

	$("#add").on('click', function() {
		console.log(user.name);
		socket.emit('add friend', {
			user: user.name,
			friend: $("#friendname").val()
		});

		angular.element($('#left-container')).scope().update();
	});	
});
