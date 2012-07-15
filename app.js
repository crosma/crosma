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
	,colorize = require('colorize')
	,chronicle = require('chronicle')
;


/******************************************************************************
********* Basic little crap
******************************************************************************/
module.exports.servers = {};

//add gray to the colors of colorize. Nowhere else for this really
colorize.ansicodes['gray'] = '\033[90m';


/******************************************************************************
********* Process handling that is currently broke in windows.
******************************************************************************/
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
********* Set up chronicle and static files in config
******************************************************************************/
chronicle.setup({
	basepath: config.root + config.static_dir
});


exports.staticize = function(url) {
	return chronicle.chronicle(config.static_url + url);
};

config.local_css_files = config.local_css_files.map(exports.staticize);
config.local_js_files = config.local_js_files.map(exports.staticize);

/*
for (i=0; i<app.config.local_js_files.length; i++) {
	app.config.local_js_files[i] = chronicle.chronicle(app.config.static_url + app.config.local_js_files[i]);
}
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
	var 
		 status = res.statusCode
		,color = 'green'
		,remote = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res)
		,referer = req.headers['referer']
		,vhost = req.vhost_for_logger
	;
	
	if (status >= 500) color = 'red'
	else if (status >= 400) color = 'yellow'
	else if (status >= 300) color = 'cyan';
	

	return colorize.ansify(
		  '#gray['
		+ '#white[' + vhost + ']'
		+ ' | ' + (new Date().toISOString())
		+ ' | ' + remote
		+ ' | ' + req.method
		+ ' | #blue[' + req.headers.host + ']'
		+ ' | #cyan[' + req.originalUrl + ']'
		+ ' | #' + color + '[' +  + res.statusCode + ']'
		+ ' | ' + (new Date - req._startTime) + 'ms'
		+ ']'
	);
});



/******************************************************************************
********* set up the static content vhost
******************************************************************************/
module.exports.servers.static = require('./vhosts/static');


/******************************************************************************
********* set up the admin vhost
*******************************************(**********************************/
module.exports.servers.admin = require('./admin/admin.vhost');
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
app.use(express.errorHandler({dumpExceptions: true, showStack: true}));

app.listen(config.port);

console.log('NODE_ENV = ' + process.env.NODE_ENV + ', Port ' + config.port);