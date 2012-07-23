var	 app = require('../../app')
	,util = require('util')
	,mdb = require('mongoose')
	,io = null
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;


//slice(0) clones an array
var local_css_files = app.config.local_css_files.slice(0).concat([
	 app.staticize('/css/chat.css')
]);

var local_js_files = app.config.local_js_files.slice(0).concat([
	 '/io/socket.io/socket.io.js'
	,app.staticize('/js/chat.client.js')
]);

//middleware function to set the statics to custom values
function set_statics(req, res, next) {
	res.locals.config.css_files = local_css_files;
	res.locals.config.js_files = local_js_files;
	next();
}


module.exports = function(socketio) {
	io = socketio.of('/main');
	  
	io.on('connection', function (socket) {
		socket.broadcast.emit('chat', {'text': '--Someone connected.--'});
	
		socket.on('chat', function (args) {
			console.log('Got chat: ' + util.inspect(args));
			
			socket.broadcast.emit('chat', {'text': args.text});
		});
		
	});
	
	
	return module;
}

page.handles('/chat', 'get', set_statics, function(req, res, next) {
	res.render('chat.jade');
});
