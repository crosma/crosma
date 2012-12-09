var	 app = require('../app')
	,express = require('express')
	,connect = require('connect')
	,utils = connect.utils;
;


module.exports = createController;

function createController(server, options) {
	function controller() {}

	controller._server = server;
	
	//load a db connection?
	controller.require_db = true
		
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
			
			app.mysql_pool.acquire(function(err, client) {
				req.db = client;
		
	
				console.log('Before');
				
				
				
				page_func(req, res, next);
				
				console.log('After');
				
				app.mysql_pool.release(client);
			
			});
			
		}.bind(this));
		
		
		this._server._router.route(method.toLowerCase(), path, middleware);
		
		
		return
		
		middleware.push(this.before_load.bind(this));
		
		if (this.require_db) {
			middleware.push(this.load_db.bind(this)); 
		}
		
		if (this.require_auth) {
			middleware.push(this.check_auth.bind(this)); 
		}
		
		return; 

		
		console.log(path);
		

		
		//get any argument after the first two, these are the callbacks
		callbacks = [].slice.call(arguments, 2); 
		
		//add the controllers middleware
		callbacks = middleware.concat(callbacks);	
		
		//add the route to the router
		this._server._router.route(method.toLowerCase(), path, callbacks);
		
		return this;
	}
	
	controller.before_load = function(req, res, next) {
		res.locals.config.title = this.title;
		
		next();
	}
	
	controller.load_db = function(req, res, next) {	
		app.mysql_pool.acquire(function(err, client) {
			req.db = client;
			next();
		});
	}
	
	controller.check_auth = function(req, res, next) {
		if (!req.session.logged_in)
		{
			res.err('You must be logged in to view this page.');
			res.redirect('/');
			//res.render('index.jade');
		}
		else
		{
			next();
		}
	}
	
	return controller;
}

createController.createController = createController;