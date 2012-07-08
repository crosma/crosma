console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');

var config = module.exports.config = require('./config');

/******************************************************************************
********* Set up globals
******************************************************************************/
var  express = require('express')
	,assert = require('assert')
	,app = module.exports.express = express()
	,fs = require('fs')
	,crypto = require('crypto')
	,shasum = crypto.createHash('sha1')
	,util = require('util')
;


/*
process.on("uncaughtException", function(err) {
  console.error("[uncaughtException]", err);
  console.error(err.stack);
  return process.exit(1);
});
*/

//This all doesnt work because of a bug in node
/*
process.on("SIGTERM", function() {
  console.log("SIGTERM (killed by supervisord or another process management tool)");
  return process.exit(0);
});

process.on("SIGINT", function() {
  console.log("SIGINT");
  return process.exit(0);
});
*/

/******************************************************************************
********* Set up mongoose
******************************************************************************/
var mongoose = require('mongoose');

mongoose.schema = require('./lib/mongodb/schema');

mongoose.handler = function CreateHandler(req, res, cb)
{
	var hnd = function(err, result) {
		if (err)
		{
			console.log('---Mongo---' + err + '---Mongo---');
			throw Error('MongoDB Error: ' + err);
		}
		else
		{
			cb(result);
		}
	}
	
	return hnd;
};


mongoose.connect(config.mongodb_uri, function(err) {
	if (err)
	{
		console.error('Error connecting to MongoDB ('+config.mongodb_uri+')');
		console.error(err);
	}
	else
	{
		console.log('Connected to MongoDB ('+config.mongodb_uri+')');
	}
});


/******************************************************************************
********* Set up validator
******************************************************************************/
var Validator = require('validator').Validator;

Validator.prototype.error = function (msg) {
    this._errors = (this._errors || []).push(msg);
}

Validator.prototype.getErrors = function () {
    return this._errors || [];
}


/******************************************************************************
********* Set some stuff up
******************************************************************************/
module.exports.servers = {};

shasum.update((new Date()).getTime().toString());
config.unique = 'v'+shasum.digest('hex').substr(0, 4);


/******************************************************************************
********* set up the static content vhost
******************************************************************************/
module.exports.servers.static = require('./vhosts/static');


/******************************************************************************
********* set up the admin vhost
*******************************************(**********************************/
module.exports.servers.admin = require('./vhosts/admin');
module.exports.servers.admin.boot();

/******************************************************************************
********* set up the main vhost
********* should be the last before the catchall.
******************************************************************************/
module.exports.servers.main = require('./vhosts/main');
module.exports.servers.main.boot();


/******************************************************************************
********* set up the catchall redirect
******************************************************************************/
module.exports.servers.static = require('./vhosts/catchall');

 
/******************************************************************************
********* Go go go go go
******************************************************************************/
app.listen(config.port);

console.log('CROSMA_ENV = ' + process.env.CROSMA_ENV + ', Port ' + config.port + ', Unique = ' + config.unique);