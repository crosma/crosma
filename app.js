console.log('---------------------------------------------');
console.log('---------------------------------------------');
console.log('---------------------------------------------');

var config = module.exports.config = require('./config');


/******************************************************************************
********* Set up globals
******************************************************************************/
var  express = require('express')
	,app = module.exports.express = express()
	,util = require('util')
	,colorize = require('colorize')
	,chronicle = require('chronicle')
	,socketio = require('socket.io')
	,redis = require('redis')
	,mysql = require('mysql2')
	,timer = require('./lib/timer')
;




/******************************************************************************
********* Basic little crap
******************************************************************************/
module.exports.servers = {};

//add gray to the colors of colorize. Nowhere else for this really
colorize.ansicodes['gray'] = '\033[90m';


/******************************************************************************
********* Set up app wide logging
******************************************************************************/
module.exports.log = function(text) {
	console.log(colorize.ansify('#cyan[' + text + ']'));
};
module.exports.debug = function(text) {
	console.log(colorize.ansify('#green[' + text + ']'));
};
module.exports.alert = function(text) {
	console.log(colorize.ansify('#red[' + text + ']'));
};

/******************************************************************************
********* Handle unhandled errors
******************************************************************************/
if (!process.listeners('uncaughtException')) {
	process.on('uncaughtException', function (e) {
		console.error(e && e.stack ? e.stack : e);
	});
}


/******************************************************************************
********* Process handling... not yet
******************************************************************************/
/*
process.on("uncaughtException", function(err) {
  console.error("[uncaughtException]", err);
  console.error(err.stack);
  return process.exit(1);
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



/******************************************************************************
********* Set up mysql
******************************************************************************/
var pool = mysql.createPool({
	host: config.mysql.address,
	port: config.mysql.port,
	user: config.mysql.user,
	password: config.mysql.pass,
	database: config.mysql.db,

	connectionLimit: 20
});

exports.mysql_pool = pool;

setInterval(function() {
	for (var i=0; i < 5; ++i) {
		pool.getConnection(function(err, db) {
			var t = new timer();
			db.execute("select 1+1 as qqq", function(err, rows, fields) {
				t.end('Yar');
				console.log(rows);
				db.end();
			});
		});
	}
}, 1000);


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
	
	if (status >= 500) color = 'red';
	else if (status >= 400) color = 'yellow';
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
********* start listening and get the http object returned
******************************************************************************/
var http_server = app.listen(config.port);


/******************************************************************************
********* Start up socket.io
******************************************************************************/
var io = socketio.listen(http_server)
	,RedisStore = require('socket.io/lib/stores/redis')
;

var pub = redis.createClient(config.redis.port, config.redis.address);
pub.on("error", function (err) {
	console.log("Redis Pub Error " + err);
});
pub.auth(config.redis.pass, function(){});

var sub = redis.createClient(config.redis.port, config.redis.address);
sub.on("error", function (err) {
	console.log("Redis Sub Error " + err);
});
sub.auth(config.redis.pass, function(){});

var client = redis.createClient(config.redis.port, config.redis.address);
client.on("error", function (err) {
	console.log("Redis Client Error " + err);
});
client.auth(config.redis.pass, function(){});

io.set('store', new RedisStore({
	 redisPub: pub
	,redisSub: sub
	,redisClient: client
}));

io.set('resource', '/io');
io.set('log level', 2);
io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);


/******************************************************************************
********* set up the static content vhost
******************************************************************************/
module.exports.servers.static = require('./vhosts/static');


/******************************************************************************
********* set up the admin vhost
*******************************************(**********************************/
module.exports.servers.admin = require('./admin/admin.vhost');
module.exports.servers.admin.boot(io);


/******************************************************************************
********* set up the main vhost
********* should be the last before the catchall.
******************************************************************************/
//module.exports.servers.main = require('./main/main.vhost');
//module.exports.servers.main.boot(io);


/******************************************************************************
********* set up the catchall redirect
******************************************************************************/
module.exports.servers.catchall = require('./vhosts/catchall');


/******************************************************************************
********* Go go go go go
******************************************************************************/
var crons = require('./crons/crons');
 
 
/******************************************************************************
********* Go go go go go
******************************************************************************/
app.use(express.errorHandler({dumpExceptions: true, showStack: true}));



console.log('NODE_ENV = ' + process.env.NODE_ENV + ', Port ' + config.port);