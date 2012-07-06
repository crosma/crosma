var	 app = require('../app')
	,express = require('express')
	,connect = require('connect')
	,utils = connect.utils;
;


function flatten(arr, ret){
  var ret = ret || []
    , len = arr.length;
	
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports.flatten(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
}


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
		var params_before = 2;
		
		if ('string' != typeof method) {
			method = 'get';
			
			params_before = 1;
		}
		
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
		
		method = method.toLowerCase()
		callbacks = flatten([].slice.call(arguments, params_before));
		callbacks = middleware.concat(callbacks);		
		
		this._server._router.route(method, path, callbacks);
		
		return this;
	}
	
	controller.before_load = function(req, res, next)
	{
		console.log('Before load...');
		
		res.locals.config.page_title = this.title;
		next();
	}
	
	controller.load_db = function(req, res, next)
	{
		console.log('Loading DB');
		next();
	}
	
	controller.check_auth = function(req, res, next)
	{
		console.log('Checking...auth...');
		
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