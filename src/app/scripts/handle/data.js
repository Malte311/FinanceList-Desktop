/**
 * Handles all operations on the data.
 */
module.exports = class Data {
	constructor(storage) {
		this.storage = storage;
	}

	getData(fileContents, quest) {
		let filterFunction = quest.connector === 'or' ? this.getDataOr : this.getDataAnd;
		return this.mergeData(filterFunction(fileContents, quest));
	}

	getDataOr(fileContents, quest) {
		return fileContents.filter(dat => {
			return quest.params.some(qu => {
				if (qu[0] === 'name' || qu[0] === 'category') {
					return dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase());
				} else if (qu[0] === 'budget') {					
					return dat[qu[0]].split(',').some(budget => budget.trim() === qu[1]);
				} else {
					return dat[qu[0]] === qu[1];
				}
			});
		});
	}

	getDataAnd(fileContents, quest) {
		return fileContents.filter(dat => {
			return quest.params.every(qu => {
				if (qu[0] === 'name' || qu[0] === 'category') {
					return dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase());
				} else if (qu[0] === 'budget') {					
					return dat[qu[0]].split(',').some(budget => budget.trim() === qu[1]);
				} else {
					return dat[qu[0]] === qu[1];
				}
			});
		});
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
	// getData(fileContents, quest) {
	// 	let data = fileContents.filter(dat => {
	// 		let ret = null;
	// 		quest.params.some(qu => {
	// 			// We do not need an exact match, e.g. when searching for 'ticket', we want to
	// 			// find entries called 'bus ticket'.
	// 			if (qu[0] === 'name' || qu[0] === 'category') {
	// 				// At least one param matched: Return true (ret = true) because connector is 'or'.
	// 				if (quest.connector === 'or' && dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase())) {
	// 					ret = true;
	// 					return true;
	// 				}

	// 				// One param does not match: 'and' connector cannot be satisfied (ret = false).
	// 				if (quest.connector === 'and' && !dat[qu[0]].toLowerCase().includes(qu[1].toLowerCase())) {
	// 					ret = false;
	// 					return true;
	// 				}
	// 			}
	// 			// Exact match is necessary for all other fields
	// 			else {
	// 				// At least one param matched? Return true (ret=true) because connector is "or".
	// 				if ( quest.connector === "or" ) {
	// 					if (qu[0] === "budget") { // Handle multiple budgets like "b1, b2, b3"
	// 						let budgets = dat[qu[0]].split(",");
	// 						ret = budgets.some((value, index, array) => {
	// 							return value.trim() === qu[1];
	// 						});
							
	// 						if (ret) return true;
	// 					} else {
	// 						if ( dat[qu[0]] === qu[1] ) {
	// 							ret = true;
	// 							return true;
	// 						}
	// 					}
	// 				}
	// 				// One param does not match => "and" connector can not be satisfied (ret=false).
	// 				else {
	// 					if (qu[0] === "budget") { // Handle multiple budgets like "b1, b2, b3"
	// 						let budgets = dat[qu[0]].split(",");
	// 						ret = !budgets.every((value, index, array) => {
	// 							return value.trim() !== qu[1];
	// 						});

	// 						if (!ret) return true;
	// 					} else {
	// 						if ( dat[qu[0]] !== qu[1] ) {
	// 							ret = false;
	// 							return true;
	// 						}
	// 					}
	// 				}
	// 			}
	// 		});

	// 		// We only get to this point when (1) connector = "or" and no match was found,
	// 		// (2) connector = "and" and no mismatch was found.
	// 		return ret !== null ? ret : !(quest.connector === 'or');
	// 	});

	// 	return this.mergeData(data);
	// }

	// /**
	//  * This function is for writing user data in .json files (user data means
	//  * either spendings or earnings; the files are named by date).
	//  * @param {JSON} data The data we want to write in form of a JSON object.
	//  */
	// storeData(data) {
	// 	// Find out which file we want to use.
	// 	var dateInStringFormat = dateToString( data.date );
	// 	var dataPath = this.storage.readPreference( "path" ) + path.sep
	// 											+ dateInStringFormat.split( "." )[1] + "."
	// 											+ dateInStringFormat.split( "." )[2] + ".json";
	// 	// File exists: Write the data in it.
	// 	if ( fs.existsSync( dataPath ) ) {
	// 		// Get existing data, add the new data and then write it.
	// 		// Note that content is an array, because the file contains an array
	// 		// of JSON objects.
	// 		var content = JSON.parse( fs.readFileSync( dataPath ) );
	// 		content.push( data );
	// 		// Sort the data (oldest data first).
	// 		content = sortData( content );
	// 		fs.writeFileSync( dataPath, JSON.stringify( content, null, 4 ) );
	// 	}
	// 	// File does not exist: Create it and write the data in it.
	// 	else {
	// 		// The content is an array containing JSON objects.
	// 		fs.appendFileSync( dataPath, "[" + JSON.stringify( data, null, 4 ) + "]" );
	// 	}
	// }

	/**
	 * This function is for overwriting data in a specified file.
	 * @param {String} file The file we want to override.
	 * @param {JSON} data The data we want to write in form of a JSON object.
	 */
	replaceData(file, data) {
		var dataPath = this.storage.readPreference( "path" ) + path.sep + file;
		// File exists: Overwrite the data in it.
		if ( fs.existsSync( dataPath ) ) {
			fs.writeFileSync( dataPath, JSON.stringify( data, null, 4 ) );
		}
		// File does not exist: Create it and write the data in it.
		else {
			fs.appendFileSync( dataPath, JSON.stringify( data, null, 4 ) );
		}
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
}