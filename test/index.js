var expect = require('chai').expect;
var sinon = require('sinon');

//Create/restore Sinon stub/spy/mock sandboxes.
var sandbox = null;

beforeEach(function() {
    sandbox = sinon.sandbox.create();
});

afterEach(function() {
    sandbox.restore();
});

describe('getLogger', function() {
    var MegaLogger = require('../lib/megaLogger');

    var logger = MegaLogger.getLogger("parent");

    it('child logger of parent', function() {

        var childLogger = MegaLogger.getLogger(
            'child',
            {
                'minLogLevel': function() { return MegaLogger.LEVELS.DEBUG; }
            },
            'parent'
        );
        sandbox.spy(console, 'log');
        var message = "Hello, little one.";
        childLogger.log(message);
        expect(console.log.callCount).to.eql(1);
        var consoleArgs = console.log.getCall(0).args;
        expect(consoleArgs[0]).to.match(/parent:child - LOG/);
        expect(consoleArgs[0].substr(-message.length)).to.eql(message);
    });
});

describe('log', function() {
    var MegaLogger = require('../lib/megaLogger');

    var lastError = null;
    var logger = MegaLogger.getLogger("test", {
        onError: function() {
            lastError = arguments;
        },
        'minLogLevel': function() { return MegaLogger.LEVELS.DEBUG; }
    });

    it('can log a message', function() {
        sandbox.spy(console, 'log');
        logger.log("hey!");
        expect(console.log.callCount).to.eql(1);
    });

    it('can log a message to call callbacks', function() {
        var message = "hey hey!";
        sandbox.spy(console, 'error');
        logger.error(message);
        expect(console.error.callCount).to.eql(1);
        expect(JSON.parse(lastError[0])[0].substr(-message.length)).to.eql(message);
    });
});

describe('colorsEnabled', function() {
    var MegaLogger = require('../lib/megaLogger');

    it('can log a message with colors', function() {
        var logger = MegaLogger.getLogger("testWithColors", {
            colorsEnabled: true
        });

        sandbox.spy(console, 'error');
        logger.error("hey!");
        expect(console.error.lastCall.args[0].indexOf("%c")).to.eql(0);
    });

    it('can log a message without colors', function() {
        var logger = MegaLogger.getLogger("testWithoutColors", {
            colorsEnabled: false
        });

        sandbox.spy(console, 'error');
        logger.error("hey!");

        expect(console.error.lastCall.args[0].indexOf("%c")).to.eql(-1);
    });
});

describe('stringSubstitutions', function() {
    var MegaLogger = require('../lib/megaLogger');

    it("can handle string substitutions", function() {
        var logger = MegaLogger.getLogger("strSubTest");
        sandbox.spy(console, 'info');
        var message = 'Congrats Bob, you got 250 points';
        logger.info('Congrats %s, you got %d points', "Bob", 250);
        expect(console.info.callCount).to.eql(1);
        var consoleArgs = console.info.getCall(0).args;
        expect(consoleArgs[0].substr(-message.length)).to.eql(message);
    });
});

// describe('', function() {
    // var MegaLogger = require('../lib/megaLogger');
// });
