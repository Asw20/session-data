/**
 * Module dependencies.
 */
var format = require('util').format;
var isArray = require('util').isArray;


/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function sessionData(options) {
  options = options || {};
  var safe = (options.unsafe === undefined) ? true : !options.unsafe;
  
  return function(req, res, next) {
    if (req.sessionData && safe) { return next(); }
    req.sessionData = _sessionData;
    next();
  }
}

/**
 * Queue sessionData `data` of the given `Variable`.
 *
 * Examples:
 *
 *      req.sessionData('var01', 'value01');
 *      req.sessionData('var01', 'value02');
 *      req.sessionData('var01', 'value03');
 *      // req.sessionData('var01') => value01,value02,value03
 *      // req.sessionData('var01') => []
 *
 *      req.sessionData('back', 'value10');
 *      req.sessionData('back', 'value11');
 *      req.sessionData('back', 'value12');
 *      // req.sessionData('back') => value12
 *      // req.sessionData('back') => value12
 *
 *      req.sessionData('var02','value20');
 *	   	req.sessionData('var03','value30');
 *		req.sessionData('var03','value31');
 *      // req.sessionData() => { var01 :[], var02: ['value20'], var03: ['value30','value31'] }
 *      // req.sessionData() => { var01 :[], var02: ['value20'], var03: ['value30','value31'] }
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
 * @param {String} variable
 * @param {String} data
 * @return {Array|Object|Number}
 * @api public
 */
function _sessionData(variable, data) {
	
	if (this.session === undefined) throw Error('req.sessionData() requires sessions');
  
	var datas = this.session.sessionData = this.session.sessionData || {};
  
	if (variable && data) {
		// Special hanging for variable "back" used in navigation panel (previous page...)
		if (variable == 'back') {
			delete datas[variable]
		} 
		// util.format is available in Node.js 0.6+
		if (arguments.length > 2 && format) {
			var args = Array.prototype.slice.call(arguments, 1);
			data = format.apply(undefined, args);
		} else if (isArray(data)) {
			data.forEach(function(val){
				(datas[variable] = datas[variable] || []).push(val);
			});
			return datas[type].length;
		}
		return (datas[variable] = datas[variable] || []).push(data);
	} else if (variable) {
		var arr = datas[variable];
		if (variable != 'back') {
			delete datas[variable];
		}
		return arr || [];
	} else {
		this.session._sessionData = {};
		return datas;
	}
}