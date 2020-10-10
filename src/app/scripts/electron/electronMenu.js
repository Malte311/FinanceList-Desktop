const config = require(__dirname + '/config.js');
const JsonStorage = require(__dirname + '/../storage/jsonStorage.js');

const openAboutWindow = require('about-window').default;

// Set all labels in dependency of the currently selected language.
let lang = (new JsonStorage()).readPreference('language');
let textData = require(`${__dirname}/../../text/text_${lang}.js`);

// This array will contain the menu at the end (we will push all the information to it).
let menuTemplate = [];

menuTemplate.push({
	label: 'FinanceList-Desktop',
	submenu: [
		{
			label: textData['aboutThisApp'],
			click: () => openAboutWindow({
				icon_path: __dirname + '/../../img/tab.png',
				copyright: 'Copyright (c) 2020 Malte Luttermann',
				package_json_dir: __dirname + '/../../../../',
				bug_report_url: 'https://github.com/Malte311/FinanceList-Desktop/issues/new?labels=bug&template=bug_report.md',
				bug_link_text: 'Report a bug',
				homepage: 'https://github.com/Malte311/FinanceList-Desktop',
				description: 'A cross-platform finance manager.',
				license: 'MIT',
				product_name: 'FinanceList-Desktop'
			})
		}
	]
});

menuTemplate.push({
	label: textData['edit'],
	submenu: [
		{
			label: textData['undo'],
			role: 'undo'
		},
		{
			label: textData['redo'],
			role: 'redo'
		},
		{ type: 'separator' },
		{
			label: textData['cut'],
			role: 'cut'
		},
		{
			label: textData['copy'],
			role: 'copy'
		},
		{
			label: textData['paste'],
			role: 'paste'
		}
	]
});

menuTemplate.push({
	label: textData['window'],
	submenu: [
		{
			label: textData['reload'],
			role: 'reload'
		},
		{ type: 'separator' },
		{
			label: textData['zoomIn'],
			role: 'zoomin',
			accelerator: 'CommandOrControl+='
		},
		{
			label: textData['zoomOut'],
			role: 'zoomout'
		},
		{
			label: textData['minimize'],
			role: 'minimize'
		},
		{
			label: textData['close'],
			role: 'close'
		},
		{
			label: textData['exit'],
			role: 'quit'
		}
	]
});

if (config.devMode) {
	menuTemplate.push({
		label: 'Developer',
		submenu: [
			{ role: 'forcereload' },
			{ role: 'toggledevtools' }
		]
	});
}

module.exports = menuTemplate;