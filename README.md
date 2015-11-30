megalogger
==========

Minimalistic JavaScript logging framework, specifically usable for the browser console

Basic Configuration
-----------

Since typically logging output should be disabled in production apps, to see logging data you need to enable development mode
and set a minimum log level, after which, messages would be shown.

You can do that by setting the following localStorage (or sessionStorage) variables:

    // Set minimum log level - all levels can be found in MegaLogger.LEVELS
    localStorage.minLogLevel = 10;

    // Enable "development mode", to allow log messages to be shown in your console
    localStorage.d = 1; // to disable it, just do a localStorage.removeItem("d");

Tip: To achieve maximum performance, the MegaLogger is in fact going to cache the localStorage/sessionStorage.* vars,
so those *SHOULD BE SET* before calling ANY MegaLogger methods.

Basic Usage
-----------

One can simply make a logger using the ``MegaLogger`` constructor, but to take easiest advantage of nested loggers, it is preferred to use ``MegaLogger``'s factory function ``getLogger``.

    // Make logger instance.
    var worldLogger = MegaLogger.getLogger('world');
    
    // Log something on highest level.
    worldLogger.log('Mega has got a new product!');

Output is:

    2015-0-30 22:35:0.216 - world - LOG  Mega has got a new product!

To create nested loggers, reference the name of the parent logger.

    // Make child logger instance.
    var newZealandLogger = MegaLogger.getLogger('new_zealand', undefined, 'world');
    
    // Log something.
    newZealandLogger.warn('The new year is in summer.');

Output is:

    2015-0-30 22:35:0.224 - world:new_zealand - WARN  The new year is in summer.

And another level.

    // Make child logger instance.
    var aucklandLogger = MegaLogger.getLogger('auckland', undefined, 'new_zealand');
    
    // Log something.
    aucklandLogger.info("We will bring the America's Cup home!");

Output is:

    2015-0-30 22:35:0.224 - world:new_zealand:auckland - INFO  We will bring the America's Cup home!

