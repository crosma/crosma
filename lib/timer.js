var timer = function(prefix) {
	this.prefix = prefix;

	this.start();
};

// properties
timer.prototype = {
	start_hr: 0
	,start_ms: 0
};

timer.prototype.start = function() {
	this.start_ms = (new Date()).getTime();
	this.start_hr = process.hrtime();

};

timer.prototype.end = function(prefix) {
	var end = process.hrtime();
	var hr = Math.round(((end[0] + end[1] / 1000000000) - (this.start_hr[0] + this.start_hr[1] / 1000000000)) * 1000000, 4) / 1000;
	var ms = (new Date()).getTime() - this.start_ms;

	if (this.prefix) {
		console.log(this.prefix + ': ' + ms + 'ms (HR: ' + hr + 'ms)');
	}

	return hr;
};

module.exports = timer;