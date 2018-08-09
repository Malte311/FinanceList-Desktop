npm run package-win
npm run package-linux

zip -r ./application/FinanceList-Desktop-win32-x64.zip FinanceList-Desktop-win32-x64
zip -r ./application/FinanceList-Desktop-linux-x64.zip FinanceList-Desktop-linux-x64

npm run package-mac
npm run create-dmg

jsdoc -r ./scripts/
