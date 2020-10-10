#!/bin/bash

npm install

if [ "$TRAVIS_OS_NAME" = "linux" ]; then

	# Install wine to run package-win
	sudo apt-get update
	sudo apt-get -y install wine
	
	# Setup ~/.wine by running a command
	wine hostnamene

	npm run package-win
	zip -r -9 application/FinanceList-Desktop-win32-x64.zip application/FinanceList-Desktop-win32-x64

	npm run package-linux
	zip -r -9 application/FinanceList-Desktop-linux-x64.zip application/FinanceList-Desktop-linux-x6

fi;
if [ "$TRAVIS_OS_NAME" = "osx" ]; then

	npm run package-mac
	npm run create-dmg

	# Test Coverage and Documentation
	npm test && nyc report --reporter=text-lcov | coveralls
	jsdoc -R readme.md -r src/app

fi;