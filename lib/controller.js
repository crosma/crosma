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
	
	controller.handles = function(path, method, callbacks)
	{
		var middleware = [];
		
		middleware.push(this.before_load.bind(this));
		
		if (this.require_db)
		{
			middleware.push(this.load_db.bind(this)); 
		}
		
		if (this.require_auth)
		{
			middleware.push(this.check_auth.bind(this)); 
		}
		
		
		//get any argument after the first two, these are the callbacks
		callbacks = [].slice.call(arguments, 2); 
		
		//add the controllers middleware
		callbacks = middleware.concat(callbacks);		
		
		//add the route to the router
		this._server._router.route(method.toLowerCase(), path, callbacks);
		
		return this;
	}
	
	controller.before_load = function(req, res, next)
	{
		res.locals.config.title = this.title;
		
		next();
	}
	
	controller.load_db = function(req, res, next)
	{	
		//Not actually doing anything with this right now.
		//Mongo is 100% async and not using anything else.
		next();
	}
	
	controller.check_auth = function(req, res, next)
	{
		//console.log('Checking...auth...');
		
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