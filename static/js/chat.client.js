var socket = io.connect('/main', {'resource': 'io', 'connect timeout': 1000});
var input = null;
var chat_div = null;
var start_time = new Date();

$(function() {
	
	input = $('#input');
	chat_div = $('#chat');
	
	addLine('Connecting...');
	
	socket.on('connect', function () {
		addLine('Connected... ' + (   (new Date()).getTime()  - start_time.getTime()		));
	});
	
	socket.on('disconnect', function () {
		addLine('Disconnected...');
		start_time = new Date();
	});
	
	socket.on('a message', function () {
		socket.emit('woot');
	});
	
	socket.on('chat', function (args) {
		addLine(args.text);
	});

	$('#send').click(function() {
		socket.emit('chat', {'text': input.val()});
		
		addLine(input.val());
	});
	
	

});

function addLine(text) {
	var now = new Date(); 
	var then = now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 

	var line = $('<div class="line"><div class="dt">' + then + ' - </div><div class="text">' + text + '</div></div>');
	
	chat_div.prepend(line);
}
