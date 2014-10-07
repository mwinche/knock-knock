/*global describe,it*/
'use strict';
var assert = require('assert'),
  knockKnock = require('../lib/knock-knock.js');

describe('knock-knock node module.', function() {
  it('must be awesome', function() {
    assert( knockKnock.awesome(), 'awesome');
  });
});
