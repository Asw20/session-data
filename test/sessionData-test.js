var vows = require('vows');
var assert = require('assert');
var util = require('util');
var sessionData = require('sessionData');


function MockRequest() {
  this.session = {};
}

function MockRequestWithoutSession() {
}

function MockResponse() {
}


vows.describe('sessionData').addBatch({

  'middleware': {
    topic: function() {
      return sessionData();
    },
    
    'when handling a request': {
      topic: function(sessionData) {
        var self = this;
        var req = new MockRequest();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          sessionData(req, res, next)
        });
      },
      
      '001 should not error' : function(err, req, res) {
        assert.isNull(err);
      },
      '002 should add a sessionData function' : function(err, req, res) {
        assert.isFunction(req.sessionData);
      },
      '003 should set sessionData value' : function(err, req, res) {
        var count = req.sessionData('var030', 'value030');
        assert.equal(count, 1);
        assert.lengthOf(Object.keys(req.session.sessionData), 1);
        assert.lengthOf(req.session.sessionData['var030'], 1);
      },
      '003-2 should get and clear previously set sessionData value' : function(err, req, res) {
        var msgs = req.sessionData('var030');
        assert.lengthOf(msgs, 1);
        assert.equal(msgs[0], 'value030');
        assert.lengthOf(Object.keys(req.session.sessionData), 0);
      },
      '005 should set multiple sessionData messages' : function(err, req, res) {
        req.sessionData('var050', 'value050');
        var count = req.sessionData('var050', 'value051');
        assert.equal(count, 2);
        assert.lengthOf(Object.keys(req.session.sessionData), 1);
        assert.lengthOf(req.session.sessionData['var050'], 2);
      },
      '005-2 should get and clear multiple previously set sessionData messages' : function(err, req, res) {
    	req.sessionData('var050', 'value052'); 
    	req.sessionData('var050', 'value053'); 
        var msgs = req.sessionData('var050');
        assert.lengthOf(msgs, 4);
        assert.equal(msgs[0], 'value050');
        assert.equal(msgs[1], 'value051');
        assert.equal(msgs[2], 'value052');
        assert.equal(msgs[3], 'value053');
        assert.lengthOf(Object.keys(req.session.sessionData), 0);
//     },
//      '006 should set sessionData messages in one call' : function(err, req, res) {
//        var count = req.sessionData('var060', ['value060', 'value061']);
//        assert.equal(count, 2);
//        var msgs = req.sessionData('var060');
//        assert.lengthOf(msgs, 2);
//        assert.equal(msgs[0], 'value060');
//        assert.equal(msgs[1], 'value061');
      },
      '008 should set sessionData messages of multiple types' : function(err, req, res) {
        req.sessionData('var080', 'value080');
        req.sessionData('var081', 'value080');
        assert.lengthOf(Object.keys(req.session.sessionData), 2);
        assert.lengthOf(req.session.sessionData['var080'], 1);
        assert.lengthOf(req.session.sessionData['var081'], 1);
      },
      '008-1 should independently get and clear messages of multiple types' : function(err, req, res) {
        var msgs = req.sessionData('var080');
        assert.lengthOf(msgs, 1);
        assert.equal(msgs[0], 'value080');
        assert.lengthOf(Object.keys(req.session.sessionData), 1);
        msgs = req.sessionData('var081');
        assert.lengthOf(msgs, 1);
        assert.equal(msgs[0], 'value080');
      },
      '010 should return all messages' : function(err, req, res) {
        req.sessionData('var100', 'value100');
        req.sessionData('var100', 'value101');
        req.sessionData('var101', 'value102');
        var msgs = req.sessionData();
        assert.lengthOf(Object.keys(msgs), 2);
        assert.lengthOf(msgs['var100'], 2);
        assert.lengthOf(msgs['var101'], 1);
        assert.lengthOf(Object.keys(req.session.sessionData), 2);
      },
      '011 should format messages' : function(err, req, res) {
        if (util.format) {
          req.sessionData('info', 'Hello %s', 'Jared');
          var msg = req.sessionData('info')[0];
          assert.equal(msg, 'Hello Jared')
        
          req.sessionData('info', 'Hello %s %s', 'Jared', 'Hanson');
          var msg = req.sessionData('info')[0];
          assert.equal(msg, 'Hello Jared Hanson')
        }
      },
      '012 should return empty array for sessionData type with no messages' : function(err, req, res) {
        var msgs = req.sessionData('what');
        assert.lengthOf(msgs, 0);
      },
    },
    
    'when handling a request with an existing sessionData function': {
      topic: function(sessionData) {
        var self = this;
        var req = new MockRequest();
        req.sessionData = function(type, msg) {
          this.session.sessionData = 'I Exist'
        }
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          sessionData(req, res, next)
        });
      },
      
      '1001 should not error' : function(err, req, res) {
        assert.isNull(err);
      },
      '1002 should not overwrite sessionData function' : function(err, req, res) {
        req.sessionData('question', 'Do you?')
        assert.equal(req.session.sessionData, 'I Exist');
      },
    },
    
    'when handling a request without a session': {
      topic: function(sessionData) {
        var self = this;
        var req = new MockRequestWithoutSession();
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          sessionData(req, res, next)
        });
      },
      
      '2001 should not error' : function(err, req, res) {
        assert.isNull(err);
      },
      '2002 should add a sessionData function' : function(err, req, res) {
        assert.isFunction(req.sessionData);
      },
      '2003 should throw when attempting to set a sessionData message' : function(err, req, res) {
        assert.throws(function() {
          req.sessionData('error', 'Something went wrong');
        });
      },
    },
  },
  
  'middleware with an unsafe option': {
    topic: function() {
      return sessionData({ unsafe: true });
    },
    
    'when handling a request with an existing sessionData function': {
      topic: function(sessionData) {
        var self = this;
        var req = new MockRequest();
        req.sessionData = function(type, msg) {
          this.session.sessionData = 'I Exist'
        }
        var res = new MockResponse();
        
        function next(err) {
          self.callback(err, req, res);
        }
        process.nextTick(function () {
          sessionData(req, res, next)
        });
      },
      
      '3001 should not error' : function(err, req, res) {
        assert.isNull(err);
      },
      '3002 should overwrite sessionData function' : function(err, req, res) {
        req.sessionData('info', 'It works!');
        assert.lengthOf(Object.keys(req.session.sessionData), 1);
        assert.lengthOf(req.session.sessionData['info'], 1);
      },
    },
  },

}).export(module);