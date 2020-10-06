/**
 * Handles all dialogs related to budget allocation.
 */
module.exports = class AllocationDialogHandler {
	constructor(view) {
		this.view = view;
	}

	/**
	 * Displays a dialog to maintain the auto allocation and handles
	 * the interaction of this dialog.
	 */
	setAllocation() {
		let modal = $('#divModal');

		modal.find('.modal-title').html(this.view.textData['autoAllocation']);
		modal.find('.modal-body').html(this.view.template.fromTemplate('autoAllocationDialog.html'));

		$('#autoAllocation').prop('checked', this.view.storage.readMainStorage('allocationOn'));
		
		let allocation = this.view.storage.readMainStorage('allocation');

		let tableRows = [[this.view.textData['budget'], this.view.textData['percentage']]];
		this.view.storage.readMainStorage('budgets').forEach(budget => {
			tableRows.push([budget[0], this.view.elt('input', {
				class: 'form-control',
				id: `val-${budget[0]}`,
				type: 'number',
				size: 3,
				min: 0,
				max: 100,
				value: allocation.find(b => b[0] === budget[0])[1]
			})]);
		});

		$('#allocationTable').html(this.view.template.table(tableRows));

		modal.find('.modal-footer #modalConf').on('click', () => {
			this.view.storage.writeMainStorage('allocationOn', $('#autoAllocation').prop('checked'));

			let sum = allocation.reduce((prev, curr) => prev + parseInt($(`[id='val-${curr[0]}']`).val()), 0);

			if (sum !== 100) { // Values must sum up to 100
				return;
			}

			allocation.forEach((budget, index) => {
				allocation[index][1] = parseInt($(`[id='val-${budget[0]}']`).val());
			});

			this.view.storage.writeMainStorage('allocation', allocation);

			modal.modal('hide');
			this.view.updateView();
		});
	}
}