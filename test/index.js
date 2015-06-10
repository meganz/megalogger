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
        expect(consoleArgs[2]).to.eql(message);
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
        sandbox.spy(console, 'error');
        logger.error("hey hey!");
        expect(console.error.callCount).to.eql(1);
        expect(JSON.parse(lastError[0])[2]).to.eql("hey hey!");
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

describe('colorsEnabledDependingOnTheEnvironment', function() {
    var MegaLogger = require('../lib/megaLogger');


    var userAgents = {
        'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34': false,
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)': false,
        'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko': false,
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0': false,
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0': true,
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36': true
    };

    Object.keys(userAgents).forEach(function(k) {
        var v = userAgents[k];
        if(typeof(window) === 'undefined') {
            window = {'fakeWindow': true, 'navigator': {'userAgent': ''}};
        }

        var testTitle = 'agent: ' + k + ", have support for console formatting: " + v;

        it(testTitle, function() {
            window.navigator.userAgent = k;
            expect(MegaLogger._environmentHaveSupportForColors()).to.eql(v, testTitle);
        });
    });

});
