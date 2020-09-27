/**
 * Handles all operations on the data.
 */
module.exports = class Data {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Returns data from an array, filtered by a given quest.
	 * 
	 * @param {array} fileContents The contents of the array to be filtered.
	 * @param {object} quest Contains a connector (or/and) and an array of parameters to
	 * filter objects. Example:
	 * quest = { connector: 'or', params: [['type', 'earning'], ['budget', 'checking account']] }
	 * @return {array} All the data which match the quest, in form of an array containing objects.
	 */
	getData(fileContents, quest) {
		let filterFn = quest.connector === 'and' ? ((a, b) => a && b) : ((a, b) => a || b);
		
		return this.mergeData(this.getDataReduce(fileContents, quest, filterFn));
	}

	/**
	 * Does the actual filtering for the getData function.
	 * 
	 * @param {array} fileContents The content to be filtered.
	 * @param {object} quest Specifies how to filter the data.
	 * @param {function} connectFn Specifies the connector in the reduce function call. There are
	 * two cases:
	 * 1. connector: 'or' => connectFn = (a, b) => a || b
	 * 2. connector: 'and' => connectFn = (a, b) => a && b
	 * @return {array} All data which match the quest.
	 */
	getDataReduce(fileContents, quest, connectFn) {
		return fileContents.filter(dat => {
			return quest.params.reduce((prev, curr) => {
				if (curr[0] === 'name' || curr[0] === 'category') {
					var ret = dat[curr[0]].toLowerCase().includes(curr[1].toLowerCase());
				} else if (curr[0] === 'budget') {					
					var ret = dat[curr[0]].split(',').some(budget => budget.trim() === curr[1]);
				} else {
					var ret = dat[curr[0]] === curr[1];
				}

				return connectFn(prev, ret);
			}, quest.connector === 'and');
		});
	}

	/**
	 * Deletes a given entry in a given file.
	 * @param {String} file The file which contains the data.
	 * @param {String} data The id (timestamp) of the data we want to delete.
	 */
	deleteData(file, data) {
		var dataPath = this.storage.readPreference( "path" ) + path.sep + file;
		if ( fs.existsSync( dataPath ) ) {
			var content = this.storage.readJsonFile( dataPath );
			var newContent = [];
			for ( var i = 0; i < content.length; i++ ) {
				if ( parseInt( data ) != content[i].date ) {
					newContent.push( content[i] );
				}
				else {
					var budgets = readMainStorage( "budgets" );
					for ( var j = 0; j < budgets.length; j++ ) {
						if ( budgets[j][0] == content[i].budget ) {
							if ( content[i].type == "earning" ) {
								budgets[j][1] = Math.round( (budgets[j][1] - content[i].amount) * 1e2 ) / 1e2;
							}
							else if ( content[i].type == "spending" ) {
								budgets[j][1] = Math.round( (budgets[j][1] + content[i].amount) * 1e2 ) / 1e2;
							}
						}
					}
					writeMainStorage( "budgets", budgets );

					var allTimeTransactions = content[i].type == "earning" ?
											readMainStorage( "allTimeEarnings" ) :
											readMainStorage( "allTimeSpendings" );
					for ( var j = 0; j < allTimeTransactions.length; j++ ) {
						if ( allTimeTransactions[j][0] == content[i].budget ) {
							allTimeTransactions[j][1] = Math.round( (allTimeTransactions[j][1] - content[i].amount) * 1e2 ) / 1e2;
						}
					}
					writeMainStorage( content[i].type == "earning" ?
									"allTimeEarnings" :
									"allTimeSpendings", allTimeTransactions );
				}
			}
			fs.writeFileSync( dataPath, JSON.stringify( newContent, null, 4 ) );
		}
	}

	mergeData(data) {
		// Display partitioned entries as one entry. Only neccessary for earnings, since
		// spendings can not be partitioned.
		var toJoin = [];
		var allJoins = [];
		for ( var i = 0; i < data.length - 1; i++ ) {
			// The timestamp acts as an identifier since it is unique
			// (data is sorted by time)
			if ( data[i].date === data[i + 1].date
					&& data[i].type === "earning" && data[i + 1].type === "earning" ) {
				// Remember indices of equal IDs
				toJoin.push( i );
				toJoin.push( i + 1 );
			}
			// Join entries
			else if ( toJoin.length > 1 ) {
				allJoins.push( toJoin );
				// Reset entries to join
				toJoin = [];
			}
		}
		if ( toJoin.length > 1 ) {
			allJoins.push( toJoin );
			toJoin = [];
		}

		if ( allJoins.length > 0 ) {
			data = this.joinData( allJoins, data );
		}

		return data;
	}

	/**
	 * Joins entries to one entry (just for a nicer display style, the storage remains unchanged).
	 * @param {number[][]} indices The indices we want to join. Every array specifies indicies which
	 * we want to join. We might have more than 1 of these arrays, so this parameter is an array of arrays.
	 * @param {Object[]} data Contains the entries.
	 * @return {Object[]} The data with joined entries.
	 */
	joinData(indices, data) {
		// Remove duplicates
		for ( var i = 0; i < indices.length; i++ ) {
			var elem = indices[i];
			elem = elem.filter( function(item, pos) {
				return elem.indexOf(item) == pos;
			});
			indices[i] = elem;
		}
	
		// Join every array of indices. We go backward, because the indices would change otherwise
		// after a join.
		for ( var i = indices.length - 1; i >= 0; i-- ) {
			var newEntry = data[indices[i][0]];
			for ( var j = 0; j < indices[i].length; j++ ) {
				if ( !newEntry.budget.toLowerCase().includes(data[indices[i][j]].budget.toLowerCase()) ) {
					newEntry.budget += ", " + data[indices[i][j]].budget;
					newEntry.amount = Math.round( (newEntry.amount + data[indices[i][j]].amount) * 1e2 ) / 1e2;
				}
			}
			data[indices[i][0]] = newEntry;
			data.splice( indices[i][0] + 1, indices[i].length - 1 );
		}
	
		return data;
	}

	/**
	 * This function sorts data by date (oldest first) and then by name.
	 * @param {JSON[]} data The data we want to sort.
	 * @return {JSON[]} The sorted data.
	 */
	sortData( data ) {
		return data.sort( function( obj1, obj2 ) {
			return this.sortFunction( obj1, obj2 );
		});
	}

	/**
	 * Sorts objects by date and then by name.
	 * @param {JSON} a The first object to compare.
	 * @param {JSON} b The second object to compare.
	 * @return {number} -1 in case the first object is older; 1 in case the second
	 * object is older; with same dates: -1 if first object is alphabetically smaller,
	 * 1 if second object is alphabetically smaller, 0 else
	 */
	sortFunction( a, b ) {
		var o1 = a["date"];
		var o2 = b["date"];

		var p1 = a["name"].toLowerCase();
		var p2 = b["name"].toLowerCase();

		if (o1 < o2) return -1;
		if (o1 > o2) return 1;
		if (p1 < p2) return -1;
		if (p1 > p2) return 1;
		return 0;
	}
}