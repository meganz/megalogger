var expect = require('chai').expect;
var sinon = require('sinon');
var MegaLogger = require('../lib/megaLogger');

describe('log', function() {
    var lastError = null;
    var logger = new MegaLogger("test", {
        onError: function() {
            lastError = arguments;
        }
    });

    it('can log a message, call callbacks', function() {
        sinon.spy(console, 'log');
        logger.log("hey!");
        expect(console.log.callCount).to.eql(1);

        sinon.spy(console, 'error');
        logger.error("hey hey!");
        expect(console.error.callCount).to.eql(1);
        expect(lastError[2]).to.eql("hey hey!");
    });
});