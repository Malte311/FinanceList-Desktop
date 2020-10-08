const {createUniqueTimestamp, getCurrentTimestamp, stepInterval} = require(__dirname + '/../utils/dateHandler.js');
const Transact = require(__dirname + '/../handle/transact.js');

/**
 * Handles recurring transactions.
 */
module.exports = class RecurrTrans {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Executes all due recurring transactions.
	 */
	execRecurrTransact() {
		let recurrTrans = this.storage.readMainStorage('recurring');

		for (let t of recurrTrans) {
			while (t.nextDate <= getCurrentTimestamp()) {
				if (t.endDate < 0 || (t.endDate > 0 && t.nextDate <= t.endDate)) {
					if (t.type === 'earning') {
						let allocOn = this.storage.readMainStorage('allocationOn') && t.allocationOn;
						(new Transact(this.storage)).addEarning(this.transToObj(t), allocOn);
					} else {
						(new Transact(this.storage)).addSpending(this.transToObj(t));
					}

					t.nextDate = stepInterval(t.startDate, t.nextDate, t.interval);
					
					this.storage.writeMainStorage('recurring', recurrTrans);
				} else {
					this.deleteRecurringTransaction(t.startDate); // End date reached
					break;
				}
			}

			if (t.endDate > 0 && t.nextDate > t.endDate) {
				this.deleteRecurringTransaction(t.startDate);
			}
		}
	}

	/**
	 * Creates a new recurring transaction.
	 * 
	 * @param {object} transObj The transaction object to add.
	 */
	addRecurringTransaction(transObj) {
		transObj.startDate = createUniqueTimestamp(transObj.startDate, this.storage);
		transObj.nextDate = transObj.startDate;

		this.storage.addToMainStorageArr('recurring', transObj);
		this.execRecurrTransact();
	}

	/**
	 * Edits a recurring transaction.
	 * 
	 * @param {number} startDate The startDate property of the transaction which should be
	 * edited. Since this property is unique, it acts as an identifier.
	 * @param {object} newProps An object containing all properties which should be updated,
	 * with the new values for each property.
	 */
	editRecurringTransaction(startDate, newProps) {
		let recurrTrans = this.storage.readMainStorage('recurring');

		let trans = recurrTrans.find(trans => trans.startDate === startDate);
		trans = Object.assign(trans, newProps);

		this.storage.writeMainStorage('recurring', recurrTrans);
	}

	/**
	 * Deletes a recurring transaction.
	 * 
	 * @param {number} startDate The startDate property of the transaction which should be
	 * deleted. Since this property is unique, it acts as an identifier.
	 */
	deleteRecurringTransaction(startDate) {
		let recurrTrans = this.storage.readMainStorage('recurring');

		let index = recurrTrans.findIndex(trans => trans.startDate === startDate);
		recurrTrans.splice(index, 1);

		this.storage.writeMainStorage('recurring', recurrTrans);
	}

	/**
	 * Transform a transaction object into a data object.
	 * 
	 * @param {object} trans The transaction object.
	 * @return {object} The data object.
	 */
	transToObj(trans) {
		return {
			date: trans.nextDate,
			name: trans.name,
			amount: trans.amount,
			budget: trans.budget,
			type: trans.type,
			category: trans.category
		};
	}
}