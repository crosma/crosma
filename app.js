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
	,shasum = crypto.createHash('sha1');
;


/******************************************************************************
********* Set some stuff up
******************************************************************************/
module.exports.servers = {};

shasum.update((new Date()).getTime().toString());
config.unique = shasum.digest('hex').substr(0, 8);


/******************************************************************************
********* set up the static content vhost
******************************************************************************/
module.exports.servers.static = require('./vhosts/static');


/******************************************************************************
********* set up the main vhost
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