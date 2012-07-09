/*
Class this shit Checkup
Server & browser side form validation

Form validation idea for node and bootstrap

	.control-group
		label.control-label(for="email") Email Address
		.controls
			input.input-xlarge(id="email", name="email", type="text", placeholder="Email Address", value=user.email)

-Just send the checks array to the client via json...may not work as functions?
-add the span.inline-help to the form automaticly

-maybe a validator name 
--to use as a unique file name (ie admin_edit_user)
--use middleware to send client file (ie <script src="/checkup/admin_edit_user.js"></script>)
--use uglify if available?
---Uglify can also make pretty javascript...for dev mode

--Will need a js file for client side that is all of the sanitizers and checks

-Two types of client side scripts, active and passive
--Passive just sets up span.inline's
--Active runs the checks real time
*/

var checks = module.exports = {
	equalsField: function(field) {
		return {
			check: function(str, form)
			{
				//how do we get req.body to this? ...passed through middleware somehow?
				return str == $(form[field]).val(); //used to validate server side
			}
			,clientString: function()
			{
				return 'equalsField(\'' + field + '\')'; //used to send to client?
			}
		};
		
	},

	len: function(min, max) {
		return {
			check: function(str, form)
			{
				return str.length >= min && (max === undefined || str.length <= max);
			}
			,clientString: function()
			{
				return 'len(' + min + ', ' + max + ')'; //used to send to client?
			}
		};
	},
	
	notEmpty: function() {
		return {
			check: function(str, form)
			{
				return !str.match(/^[\s\t\r\n]*$/); //used to validate server side
			}
			,clientString: function()
			{
				return 'notEmpty()'; //used to send to client?
			}
		};
	}
	
}; //hrm

	
var validators = {
	email: {
		 filter: [checkup.sanitize.trim()] //clean before checking
		,check: [checkup.checks.notEmpty(), checkup.checks.isEmail()] //Can, but doesnt have to be array
		,msg: 'Enter a valid email.'
		,msg_client: 'Not valid.';
	}
	
	,password1: [ //Can have more than one check for each field
		{
			 skip_if_not: req.body.notEmpty() //only do the checks if this...
			,check: checkup.checks.len(6,60)
			,break_on_fail: true //do not move on to the next check for this field
			,msg: 'Your password must be at least 6 characters.'
			,msg_client: 'Min 6 characters.'
		}, {
			,check: [checkup.checks.equalsField('password2')]
			,msg: 'Passwords do not match.'
			,msg_client: 'Does not match.'
		}
	]
	
	,password2: [
		{
			 skip_if_not: req.body.notEmpty()
			,check: checkup.checks.len(6,60)
			,break_on_fail: true //do not move on to the next check for this field
			,msg: 'Your password must be at least 6 characters.'
			,msg_client: 'Min 6 characters.'
		}, {
			,check: checkup.checks.equalsField('password1')
			,msg: 'Passwords do not match.'
			,msg_client: 'Does not match.'
		}
	]
};

function run_validators(validators, form)
{
	var errors = [];
	
	for (field_name in validators)
	{
		var str = req.body[field_name]; //the string to work with
		
		var actions = jQuery.isArray(validators[field_name]) ? validators[field_name] : [validators[field_name]];
		var do_break = false; //allows the skip_if_not to skip all future actions in this field
		
		for (var a=0; a<actions.length; a++ && !do_break) {
			var action = actions[a];
			var res = true;
			
			//Skip is these are not true
			var things = jQuery.isArray(action.skip_if_not) ? action.skip_if_not : [action.skip_if_not];
			for (var i=0; i<things.length; i++) {
				if (!things[i].check(str)) {
					do_break = true;
					break;
				}
			}
			do_break || continue; 

			//filter string
			var things = jQuery.isArray(action.filter) ? action.filter : [action.filter];
			for (var i=0; i<things.length; i++) {
				str = things[i].filter(str);
			}
			
			//run checks, stops if one fails
			var things = jQuery.isArray(action.checks) ? action.checks : [action.checks];
			for (var i=0; i<things.length; i++ && res) {
				res = things[i].check(str, form);
			}
			
			//failed? push the error
			if (!res)
			{
				errors.push(action.msg);
			}
			
			//dont do any more checks on this field?
			if (action.break_on_fail && !res)
			{
				break;
			}
		}
		
	}
}

//for client
function findParent(ele, parent_class) {
	//use jquery to get the .control-group above the input
	
	var parent = null;
	
	do {
		parent = get parent of ele
	} while (parent != null && parent does not have parent_class)
	
	return parent;
}