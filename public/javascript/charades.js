var color = 'black';
$(document).ready(function() {
	$(".color").on('click', function() {
		color = $(this).attr('id');
		});
	});
		
var socket = io();
paper.install(window);
window.onload = function() {
	paper.setup('myCanvas');
	var tool = new Tool();
	tool.minDistance = 5;
	var path;

	tool.onMouseDown = function(event) {
		path = new Path();
		path.strokeColor = color;
		socket.emit('mouse down', {
			color: path.strokeColor
		});
	}

	tool.onMouseDrag = function(event) {
		path.add(event.point);
		socket.emit('mouse drag', {
			x: event.point.x,
			y: event.point.y
		});
	}
			
	socket.on('mouse down', function(data) {
		path = new Path();
		path.strokeColor = data.color;
	});
			
	socket.on('mouse drag', function(data) {
		path.add(new Point(data.x, data.y));
		view.update();
	});
}
