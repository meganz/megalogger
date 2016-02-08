var expect = require('chai').expect;
var sinon = require('sinon');

//Create/restore Sinon stub/spy/mock sandboxes.
var sandbox = null;

// needs to be initialised here, since MegaLogger would cache it after the first call to MegaLogger...
global.localStorage = {
    'minLogLevel': 0,
    'd': 1
};

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

    var lastCritical = null;
    var logger = MegaLogger.getLogger("test", {
        onCritical: function() {
            lastCritical = arguments;
        },
        'minLogLevel': function() { return MegaLogger.LEVELS.DEBUG; }
    });
    var logger2 = MegaLogger.getLogger("isEnabled", { isEnabled: false });

    it('can log a message', function() {
        sandbox.spy(console, 'log');
        logger.log("hey!");
        expect(console.log.callCount).to.eql(1);
    });

    it('can disable logging', function() {
        sandbox.spy(console, 'info');
        logger2.info("heya!");
        expect(console.info.callCount).to.eql(0);
    });

    it('can log a message to call callbacks', function() {
        var message = "hey hey!";
        sandbox.spy(console, 'error');
        logger.critical(message);
        expect(console.error.callCount).to.eql(1);
        expect(JSON.parse(lastCritical[0])[0].substr(-message.length)).to.eql(message);
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


describe('printDate', function() {
    var MegaLogger = require('../lib/megaLogger');

    it("can omit date printing", function() {
        var logger = MegaLogger.getLogger("printDate1");
        var logger2 = MegaLogger.getLogger("printDate2", {
            printDate: false
        });
        sandbox.spy(console, 'info');
        logger.info('Hello, world!');
        expect(console.info.callCount).to.eql(1);
        var consoleArgs = console.info.getCall(0).args;
        var withDate = String(consoleArgs[0]).slice(0);
        logger2.info('Hello, world!');
        expect(console.info.callCount).to.eql(2);
        consoleArgs = console.info.getCall(1).args;
        var withoutDate = String(consoleArgs[0]).slice(0);
        expect(withDate.substr(withDate.indexOf(" - ")+3).replace('printDate1','printDate2')).to.eql(withoutDate);
    });
});

// describe('', function() {
    // var MegaLogger = require('../lib/megaLogger');
// });
