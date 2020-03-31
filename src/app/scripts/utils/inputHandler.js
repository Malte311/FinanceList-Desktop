/**
 * Class for dealing with user inputs.
 */
module.exports = class InputHandler {
	constructor(storage) {
		this.storage = storage;

		// These should not be changed because these values are used in error messages.
		this.maxStrLen = 100;
		this.maxSWLen = 30; // Maximum length for a single word.
	}

	isValidBudgetName(name) {
		let budgets = this.storage.readMainStorage('budgets');
		return name && name !== '' && name.length <= this.maxSWLen && !budgets.map(b => b[0]).includes(name);
	}
}