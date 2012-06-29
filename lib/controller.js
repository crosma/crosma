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

	controller.template = true;
	
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
		
		if (this.template)
		{
			middleware.push(this.template_header.bind(this));
		}
		
		method = method.toLowerCase()
		callbacks = flatten([].slice.call(arguments, params_before));
		callbacks = middleware.concat(callbacks);		

		if (this.template)
		{
			callbacks.push(this.template_footer.bind(this));
		}
		
		//console.log(callbacks);
		
		this._server._router.route(method, path, callbacks);
		
		return this;
	}
	
	controller.before_load = function(req, res, next)
	{
		console.log('Before load...');
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
		next();
	}
	
	controller.template_header = function(req, res, next)
	{
		console.log('template_header - ' + this.title);
		
		res.write('Ok');
		
		next();
	}
	
	controller.template_footer = function(req, res, next)
	{
		console.log('template_footer');
		next();
	}
	
	return controller;
}

createController.createController = createController;