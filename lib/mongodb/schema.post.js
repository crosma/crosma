var	 app = require('../../app')
	,util = require('util')
	,mdb = require('mongoose')
	,Schema = mdb.Schema
;

var Post = new Schema({
	title: {
		 type: String
		,trim: true
	}
	
	,_poster: { 
		 type: Schema.ObjectId
		,ref: 'User'
	}

	,date: {
		 type: Date
		,default: function(){
			return new Date()
		}
	}
});


//Leave at the end of the file.
module.exports = mdb.model('Post', Post);