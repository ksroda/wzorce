$(document).ready(function() {
		$("#myCanvas").hide();
		$("#tool-belt").hide();
	});
	
	var player = {
		name:			"Marek",
		serverId:	0,
		path:			0,
		pathProperties:	{
			color:	'black',
			size:		1
		},
		drawPath: function() {
			this.path = new Path();
			this.path.strokeColor = this.pathProperties.color;
			this.path.strokeWidth = this.pathProperties.size;
		},
		addPoint: function(position) {
			if(this.path) this.path.add(new Point(position.x, position.y));
			view.update();
		}
	};
	
	var socket = io();
	
	paper.install(window);
	window.onload = function() {
		//------------------------------------Paper.js--------------------------------------
		paper.setup('myCanvas');
		var tool = new Tool();
		tool.minDistance = 5;
		
		socket.emit('update rooms');
		
		tool.onMouseDown = function(event) {
			player.drawPath();
			socket.emit('mouse down', player.pathProperties);
		}

		tool.onMouseDrag = function(event) {
			player.addPoint(event.point);
			socket.emit('mouse drag', {
				x:	event.point.x,
				y:	event.point.y
			});
		}
		
		//------------------------------------JQuery-----------------------------------------
		$("#create").on('click', function() {
			sendWelcome($("#roomname").val());
		});
		
		$(".color").on('click', function() {
			player.pathProperties.color = this.id;
		});
		
		$(".size").on('click', function() {
			player.pathProperties.size = this.id;
		});
		
		
		//------------------------------------Socket-----------------------------------------
		
		socket.on('mouse down', function(properties) {
			player.pathProperties = properties;
			player.drawPath();
		});
	
		socket.on('mouse drag', function(position) {
			player.addPoint(position);
		});
		
		socket.on('update rooms', function(rooms) {
			addRoomsToList(rooms);
		});

		socket.on('remove room', function(room) {
			$('#' + room + ".room").remove();
		});

		function addRoomsToList(rooms) {
			$("#rooms-list").html('');
			for(var i = 0; i < rooms.length; i++) {
				$("#rooms-list").append('<button id="' + rooms[i].name + 
				'" class="list-group-item room"><span class="room-name">' + rooms[i].name + 
				'</span><span class="badge">' + rooms[i].numUsers + '</span></button>');
				$('#' + rooms[i].name).on('click', function() {
					sendWelcome($(this).attr('id'));
				});
			}
		}
		
		function sendWelcome(roomName) {
			socket.emit('welcome', {
				name:	"Marek",
				room:	roomName
			});
		
			$("#myCanvas").show();
			$("#tool-belt").show();
			$("#rooms").hide();
		};
	};
