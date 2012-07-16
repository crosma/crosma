var	 app = require('../../app')
	,util = require('util')
	,mdb = require('mongoose')
	,io = null
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;


module.exports = function(socketio) {
	io = socketio
	  .of('/main')
	  .on('connection', function (socket) {
		socket.emit('a message', {
			that: 'only'
		  , '/chat': 'will get'
		});
		chat.emit('a message', {
			everyone: 'in'
		  , '/chat': 'will get'
		});
	});
	
	return module;
}

page.handles('/chat', 'get', function(req, res, next) {
	res.render('chat.jade');
});
