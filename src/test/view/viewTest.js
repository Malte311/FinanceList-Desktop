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

	describe('#beautifyAmount()', function() {
		it('should not change a number with two decimal places', function() {
			assert.equal(view.beautifyAmount('27.50'), '27.50');
			assert.equal(view.beautifyAmount('-27.99'), '-27.99');
			assert.equal(view.beautifyAmount('00.00'), '00.00');
		});

		it('should add a zero to a number with one decimal place', function() {
			assert.equal(view.beautifyAmount('27.5'), '27.50');
			assert.equal(view.beautifyAmount('-27.9'), '-27.90');
			assert.equal(view.beautifyAmount('42.0'), '42.00');
			assert.equal(view.beautifyAmount(5.5), '5.50');
		});

		it('should add a dot and two zeros to a number with no decimal places', function() {
			assert.equal(view.beautifyAmount('27'), '27.00');
			assert.equal(view.beautifyAmount('-27'), '-27.00');
			assert.equal(view.beautifyAmount(42), '42.00');
			assert.equal(view.beautifyAmount(0), '0.00');
		});
	});
});