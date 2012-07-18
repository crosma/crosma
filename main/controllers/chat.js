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
	 app.staticize('/css/lib/jquery-ui-timepicker-addon.css')
	,app.staticize('/css/lib/jquery-ui-1.8.21.custom.css')
]);

var local_js_files = app.config.local_js_files.slice(0).concat([
	 '/io/socket.io/socket.io.js'
	,app.staticize('/js/chat.js')
]);

//middleware function to set the statics to custom values
function set_statics(req, res, next) {
	//res.locals.config.css_files = local_css_files;
	res.locals.config.js_files = local_js_files;
	next();
}


module.exports = function(socketio) {
	io = socketio.of('/main');
	  
	io.on('connection', function (socket) {
		socket.on('msg', function (name, fn) {
			console.log('Got a ferret. Name: ' + name);
			//fn('woot');
		});
	});
	
	return module;
}

page.handles('/chat', 'get', set_statics, function(req, res, next) {
	res.render('chat.jade');
});
