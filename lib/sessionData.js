/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;

var srcName='sessionData';
//var _ = require('lodash');

/**
 * Expose `sessionData()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function sessionData(options) {
//  console.log ('%s options:%s',srcName,options);	
  options = options || {};
//  console.log ('%s options:%s',srcName,options);
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;
//  console.log ('%s safe:%s',srcName,safe);
  
  return function(req, res, next) {
    if (req.sessionData && safe) {
    	console.log ('%s req.sessionData:%s',srcName,req.sessionData);
    	return next(); 
    }
    req.sessionData = _sessionData;
    next();
  }
}

/**
 * Queue sessionData `value` of the given `Variable`.
 *
 * Examples:
 * 
 * Regular behavior:
 *      req.sessionData('var01', 'value01');
 *      req.sessionData('var01', 'value02');
 *      req.sessionData('var01', 'value03');
 *      req.sessionData('var02', 'value20');
 *      req.sessionData('var02', 'value21');
 *      // req.sessionData('var01') => value01,value02,value03
 *      // req.sessionData('var01') => []
 *      // req.sessionData('var02') => value20,value21
 *      // req.sessionData('var02') => []
 *
 * Special behavior: config:
 *      req.sessionData('keyconf01','confvalue01', 'setup');
 *	   	req.sessionData('keyconf02','confvalue01', 'setup');
 *		req.sessionData('keyconf03','confvalue02', 'read');
 *      // req.sessionData() => { var01 :[], var02: ['value20'], var03: ['value30','value31'] }
 *      
 * Special behavior: breadcrumb
 *      req.sessionData('breadcrumb', 'value10');
 *      req.sessionData('breadcrumb', 'value11');
 *      req.sessionData('breadcrumb', 'value12');
 *      // req.sessionData('breadcrumb') => value12
 *      // req.sessionData('back') => value12

 *
 *
 * Formatting:
 *
 * sessionData notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.sessionData()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.sessionData('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param {String} variable (key)
 * @param {String} value    (value of the key)
 * @param {String} parameter (
 * @return {Array|Object|Number}
 * @api public
 */
function _sessionData(variable, value, parameter) {
	
	if (this.session === undefined) throw Error('req.sessionData() requires sessions');
  
	var values = this.session.sessionData = this.session.sessionData || {};
  
	if (variable && value) {
		
		// Special handling for configuration
		if (parameter=='setup') { 
			delete values[variable];
		}

		// Special handling for breadcrumb 
		if (variable == 'breadcrumb') {
			// Do not Add the same Last Url (in case of refresh
			if (value=='back') { 
//				console.log('%s values[variable].length',srcName,values[variable].length)
				if (values[variable].length < 2 ) {
					return values[variable][0]
				} else {
					values[variable].pop();
					return values[variable].pop();
				}
			} else {
				if (values[variable] && (values[variable][values[variable].length-1] == value)){
					return;
				}
			}
		} 
		
		// util.format is available in Node.js 0.6+
		if (arguments.length > 2 && format && parameter != 'setup' && parameter != 'read') {
			var args = Array.prototype.slice.call(arguments, 1);
			value = format.apply(undefined, args);
		} else if (isArray(value)) {
			value.forEach(function(val){
				(values[variable] = values[variable] || []).push(val);
			});
			return values[variable].length;
		}
		return (values[variable] = values[variable] || []).push(value);
	} else if (variable) {
		var arr = values[variable];
		if ((variable != 'breadcrumb') &&  (parameter != 'read')){
			delete values[variable];
		}
		return arr || [];
	} else {
		this.session._sessionData = {};
		return values;
	}
}