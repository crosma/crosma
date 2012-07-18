var socket = io.connect('/main', {'resource': 'io'});

socket.on('connect', function () {
	//socket.emit('hi!');
});

socket.on('a message', function () {
	socket.emit('woot');
});


$('#test').click(function() {
	console.log('Testing...');
	
	socket.emit('msg', {name: 'tobi'}, function (data) {
		console.log(data); // data will be 'woot'
	});

});