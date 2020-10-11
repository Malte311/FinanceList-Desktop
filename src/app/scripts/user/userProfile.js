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
	}
}

module.exports = UserProfile;