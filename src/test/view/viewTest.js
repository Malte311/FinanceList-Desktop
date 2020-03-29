const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const View = require(__dirname + '/../../app/scripts/view/view.js');

describe('View', function() {
	let view = new View(new JsonStorage());

	describe('#updateView()', function() {
		it('should throw an error because it should be overridden', function() {
			assert.throws(view.updateView, Error);
		});
	});
});