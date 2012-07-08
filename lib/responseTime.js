
/*!
 * Connect - responseTime
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Reponse time:
 *
 * Adds the `X-Response-Time` header displaying the response
 * duration in milliseconds.
 *
 * @return {Function}
 * @api public
 */
 
 /**
  * Modified to use  process.hrtime
  * var t = process.hrtime();
  * [ 1800216, 927643717 ]
  */

module.exports = function responseHRTime(){
  return function(req, res, next){
    var start = process.hrtime();

    if (res._responseHRTime) return next();
    res._responseHRTime = true;

    res.on('header', function(header){
	  var end = process.hrtime();
	  
	  res.setHeader('X-Response-time-hr', ((end[0] + end[1] / 1000000000) - (start[0] + start[1] / 1000000000)) + 's');
	  
    });

    next();
  };
};
