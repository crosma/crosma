
module.exports = function(req, res, next) {
	res.setHeader('X-Powered-By', 'Unicorns');
	next();
};