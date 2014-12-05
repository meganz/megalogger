
test:
	./node_modules/.bin/mocha --reporter spec

build-dist:
	rm -rf ./dist/megaLogger.js
	mkdir -p ./dist
	./node_modules/.bin/browserify --dg false --no-builtins lib/megaLogger -o ./dist/megaLogger.js

 .PHONY: test build-dist
