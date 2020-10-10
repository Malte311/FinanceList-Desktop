/**
 * Class for handling different user profiles.
 */
class UserProfile {
	constructor(user) {
		this.user = user;

		/* TODO */
	}

	switchUserProfile(user) {
		this.user = user;

		/* TODO */
	}

	addUserProfile(user) {
		console.log(user)
		/* TODO */
	}

	renameUserProfile(user, newUser) {
		console.log(user, newUser)
		/* TODO */
	}

	deleteUserProfile(user) {
		console.log(user)
		/* TODO */
	}
}

module.exports = UserProfile;