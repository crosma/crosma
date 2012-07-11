console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');

var config = module.exports.config = require('./config');
//console.log(util.inspect(config));

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


var uri = 'mongodb://' + config.mongodb.user + ':' + config.mongodb.pass + '@' + config.mongodb.address + ':' + config.mongodb.port + '/' + config.mongodb.db;

mongoose.connect(uri, function(err) {
	if (err)
	{
		console.error('Error connecting to MongoDB');
		console.error(err);
	}
	else
	{
		console.log('Connected to MongoDB');
	}
});


/******************************************************************************
********* Set up dev logger format
******************************************************************************/
express.logger.format('mydev', function(tokens, req, res){
  var status = res.statusCode
    , color = 32
	, remote = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res)
	, referer = req.headers['referer']
	, vhost = req.vhost_for_logger;
	
  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;
	
  return '\033[90m' + (new Date().toUTCString()) + ' :' + vhost + ': ' + referer + ' (' + remote + ') ' + req.method
    + ' ' + req.originalUrl + ' '
    + '\033[' + color + 'm' + res.statusCode
    + ' \033[90m'
    + (new Date - req._startTime)
    + 'ms\033[0m';
});


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