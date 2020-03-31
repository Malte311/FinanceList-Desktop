/**
 * Class for dealing with user inputs.
 */
module.exports = class InputHandler {
	constructor(storage) {
		this.storage = storage;

		// These should not be changed because these values are used in text messages.
		this.maxStrLen = 100;
		this.maxSWLen = 30; // Maximum length for a single word.
	}

	/**
	 * Validates user inputs for budget names.
	 * 
	 * @param {string} name The user input which should be validated.
	 * @return {bool} True if the name is valid, otherwise false.
	 */
	isValidBudgetName(name) {
		let budgets = this.storage.readMainStorage('budgets');
		return name && name !== '' && name.length <= this.maxSWLen && !budgets.map(b => b[0]).includes(name);
	}

	/**
	 * Validates user inputs for transaction names.
	 * 
	 * @param {string} name The user input which should be validated.
	 * @return {bool} True if the name is valid, otherwise false.
	 */
	isValidEntryName(name) {
		return name && name !== '' && name.length <= this.maxStrLen &&
			name.split(' ').every(w => w.length <= this.maxSWLen);
	}

	isValidAmount(amount) {}
}