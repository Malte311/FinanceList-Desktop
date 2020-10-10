# Install wine to run package-win
npm install wine-darwin
# Setup ~/.wine by running a command
./node_modules/.bin/wine hostnamene

npm install

npm run package-win
zip -r -9 application/FinanceList-Desktop-win32-x64.zip application/FinanceList-Desktop-win32-x64

npm run package-linux
zip -r -9 application/FinanceList-Desktop-linux-x64.zip application/FinanceList-Desktop-linux-x64

npm run package-mac
npm run create-dmg

# Tests: npm test && nyc report --reporter=text-lcov | coveralls

# Documentation, generated in directory ./out
jsdoc -R readme.md -r scripts
