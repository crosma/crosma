
function pad(num)
{
	if (num > 9) {
		return num;
	} else {
		return '0' + num;
	}
}


module.exports.full = function(dt) {
	//'dd/mm/yyyy HH:MM:ss'
	var val=0;
	return 
		  ((val = dt.getDate()) > 9 ? val : '0' + val)
		+ '/'
		+ ((val = dt.getMonth()) > 9 ? val : '0' + val)
		+ '/'
		+ dt.getFullYear()
		+ ' '
		+ ((val = dt.getHours()) > 9 ? val : '0' + val)
		+ ':'
		+ ((val = dt.getMinutes()) > 9 ? val : '0' + val)
		+ ':'
		+ ((val = dt.getSeconds()) > 9 ? val : '0' + val)
	;
}