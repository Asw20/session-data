var vows = require('vows');
var assert = require('assert');
var flash = require('index');


vows.describe('session-data').addBatch({
  
  'module': {
    'should export middleware': function () {
      assert.isFunction(sessionData);
    },
  },
  
}).export(module);