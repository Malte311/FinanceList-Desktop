const {sep} = require(__dirname + '/../storage/paths.js');

/**
 * Class for handling different user profiles.
 */
class UserProfile {
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Adds a new user profile to the storage.
	 * 
	 * @param {string} user The name of the new user profile.
	 */
	addUserProfile(user) {
		let users = this.storage.readPreference('users');
		this.storage.storePreference('users', users.concat([user]));
	}

	/**
	 * Renames a given user profile.
	 * 
	 * @param {string} user The name of the user profile to rename.
	 * @param {string} newUser The new name for the user profile.
	 */
	renameUserProfile(user, newUser) {
		let users = this.storage.readPreference('users');
		users[users.findIndex(u => u === user)] = newUser;
		this.storage.storePreference('users', users);

		let pathPrefix = this.storage.readPreference('path') + sep();
		this.storage.renamePath(pathPrefix + user, pathPrefix + newUser);

		if (this.storage.readPreference('activeUser') === user) {
			this.storage.storePreference('activeUser', newUser);
		}
	}

	/**
	 * Deletes a given user profile.
	 * 
	 * @param {string} user The name of the user profile to delete.
	 */
	deleteUserProfile(user) {
		let users = this.storage.readPreference('users');

		if (users.findIndex(u => u === user) < 0) {
			return;
		}
		
		users.splice(users.findIndex(u => u === user), 1);
		this.storage.storePreference('users', users);

		this.storage.storePreference('activeUser', this.storage.readPreference('users')[0]);
		this.storage.deletePath(this.storage.readPreference('path') + sep() + user);
	}

	/**
	 * Switches to another user profile.
	 * 
	 * @param {string} newUser The name of the user profile to switch to.
	 */
	switchToUserProfile(newUser) {
		if (this.storage.readPreference('users').includes(newUser)) {
			this.storage.storePreference('activeUser', newUser);
		}
	}
}

module.exports = UserProfile;