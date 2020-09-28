/**
 * Class for dealing with user inputs.
 */
module.exports = class InputHandler {
	constructor(storage) {
		this.storage = storage;
		this.maxStrLen = 100; // Maximum length for a whole string.
		this.maxSwLen = 30; // Maximum length for a single word.
	}

	/**
	 * Validates user inputs for budget names.
	 * 
	 * @param {string} name The user input which should be validated.
	 * @return {bool} True if the name is valid, otherwise false.
	 */
	isValidBudgetName(name) {
		let budgets = this.storage.readMainStorage('budgets');
		let validChars = !/[^a-zA-Z0-9 ]/.test(name);
		
		return !!name && validChars && name.trim() !== '' && name.length <= this.maxSwLen
			&& !budgets.map(b => b[0]).includes(name);
	}

	/**
	 * Validates user inputs for transaction names.
	 * 
	 * @param {string} name The user input which should be validated.
	 * @return {bool} True if the name is valid, otherwise false.
	 */
	isValidEntryName(name) {
		let validChars = !/[^a-zA-Z0-9 ]/.test(name);

		return !!name && validChars && name.trim() !== '' && name.length <= this.maxStrLen &&
			name.split(' ').every(w => w.length <= this.maxSwLen);
	}

	/**
	 * Validates user inputs for amounts.
	 * 
	 * @param {string} amount The user input which should be validated.
	 * @param {bool} [emptyOk = false] Specifies whether an empty string is valid or not.
	 * @return {bool} True if the amount is valid, otherwise false.
	 */
	isValidAmount(amount, emptyOk = false) {
		if (amount === null || amount === undefined) {
			return false;
		}

		amount = amount.replace(',', '.');
		
		let validChars = !/[^0-9\.]/.test(amount);
		let notEmpty = emptyOk || amount.trim() !== '';
		let dotOk = /^[^\.]*$/.test(amount) || /^\d*\.\d{0,2}$/.test(amount);

		return validChars && notEmpty && dotOk && amount.length <= this.maxStrLen
			&& amount.split(' ').every(w => w.length <= this.maxSwLen);
	}
}