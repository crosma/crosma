var	 app = require('../app')
	,express = require('express')
	,connect = require('connect')
	,utils = connect.utils;
;


module.exports = createController;

function createController(server, options) {
	function controller() {}

	controller._server = server;
	
	//require logged in user?
	controller.require_auth = true

	//page title?
	controller.title = 'Set a Damn Title'

	for (var key in options) {
		controller[key] = options[key];
    }
	
	//path, method, middleware..., callback
	controller.handles = function(path)
	{
		var middleware = [];
		var path = arguments[0];
		var method = arguments[1];
		var page_func = arguments[arguments.length-1];
		
		for (i=2; i<= arguments.length-2; i++) {
			middleware.push(arguments[i]);
		}
		
		middleware.push(function(req, res, next) {
			res.locals.config.title = this.title;
			
			if (this.require_auth && !req.session.logged_in)
			{
				res.err('You must be logged in to view this page.');
				res.redirect('/');
			}
			else
			{
				app.mysql_pool.acquire(function(err, client) {
					req.db = client;
			
					page_func(req, res, next);
					
					app.mysql_pool.release(client);
				});
			}
		}.bind(this));
		
		
		this._server._router.route(method.toLowerCase(), path, middleware);
	}

	return controller;
}

createController.createController = createController;