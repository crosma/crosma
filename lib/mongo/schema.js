var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
  
var User = new User({
    name: {
         first: String
		,last : String
    }
	,email: { type: String, required: true, index: { unique: true, sparse: true } }
	,alive: Boolean
});