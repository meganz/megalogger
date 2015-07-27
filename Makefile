
testOptions=

ifeq ($(shell uname -o),Msys)
	testOptions := "-C"
endif

test:
	./node_modules/.bin/mocha --reporter spec $(testOptions)

build-dist:
	rm -rf ./dist/megaLogger.js
	mkdir -p ./dist
	cp ./lib/megaLogger.js ./dist/megaLogger.js

 .PHONY: test build-dist
