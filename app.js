console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');
console.log('--------------------------------------------------------------------------------');

var config = require('./config');

//maybe use this to pool mysql connections?
//https://github.com/coopernurse/node-pool

/******************************************************************************
********* Set up globals
******************************************************************************/
var  express = require('express')
    ,assert = require('assert')
	,app = module.exports.express = express()
;

module.exports.config = config;

module.exports.servers = {};

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

console.log('Running on port ' + config.port);