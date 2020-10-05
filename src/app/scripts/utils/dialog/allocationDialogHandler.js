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

			console.log(allocation.reduce((prev, curr) => prev + parseInt($(`[id='${curr[0]}']`).val()), 0));

			allocation.forEach((budget, index) => {

			});

			modal.modal('hide');
			this.view.updateView();
		});
	}
}

/**
 * This function opens the automated allocation dialog.
 */
function setAllocation() {
    var currentBudgets = readMainStorage( "budgets" );
    var currentAllocation = readMainStorage( "allocation" );
    var currentBudgetsHTML = "";
    // Create a new dialog.
    createDialog( textElements.autoAllocation, text, function() {
        // Get the allocation array and iterate over it.
        var allocation = readMainStorage( "allocation" );
        // Since we want to write, we need a new object to which we push the new data.
        var newAllocation = [];
        // Set the selected value for every budget. In addition to that, we will calculate
        // the sum, to check if it is exactly 100%.
        var checkSum = 0;
        for ( var i = 0; i < allocation.length; i++ ) {
            var value = $( "#percentageSelect" + i + " " + "option:selected" ).text();
            newAllocation.push( [allocation[i][0], parseInt( value )] );
            checkSum += parseInt( value );
        }
        // Check, if input is O.K.
        if ( checkSum === 100 ) {
            // Now write the updated values in the storage.
            writeMainStorage( "allocation", newAllocation );
            // Close the dialog and update the view.
            $( this ).dialog( "close" );
            updateView();
        }
        // Input not O.K.? Show error message.
        else {
            dialog.showErrorBox( "Error", "The sum of the parts has to be 100%!" );
        }
    });
}