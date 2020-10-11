const assert = require('assert');
const JsonStorage = require(__dirname + '/../../app/scripts/storage/jsonStorage.js');
const UserProfile = require(__dirname + '/../../app/scripts/user/userProfile.js');

const {existsSync, mkdirSync, rmdirSync, unlinkSync} = require('fs');

describe('UserProfile', function() {
	let jsonStorage = new JsonStorage();
	let userProfile = new UserProfile(jsonStorage);
	let path;
	let users;

	before(function() {
		path = jsonStorage.readPreference('path');
		users = jsonStorage.readPreference('users');
		jsonStorage.storePreference('path', '/tmp/financelist');

		if (!existsSync('/tmp/financelist/')) {
			mkdirSync('/tmp/financelist/');
		}
	});

	beforeEach(function() {
		jsonStorage.storePreference('users', ['Alice', 'Bob']);
	});

	after(function() {
		jsonStorage.storePreference('path', path);
		jsonStorage.storePreference('users', users);

		if (existsSync('/tmp/financelist/mainstorage.json')) {
			unlinkSync('/tmp/financelist/mainstorage.json');
		}

		if (existsSync('/tmp/financelist/')) {
			rmdirSync('/tmp/financelist/', {recursive: true});
		}
	});

	describe('#addUserProfile()', function() {
		it('should add a new user profile to the storage', function() {
			userProfile.addUserProfile('Eve');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice', 'Bob', 'Eve']);

			userProfile.addUserProfile('Eve2');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice', 'Bob', 'Eve', 'Eve2']);
		});
	});

	describe('#renameUserProfile()', function() {
		it('should rename an existing user profile correctly', function() {
			userProfile.renameUserProfile('Bob', 'Eve');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice', 'Eve']);

			userProfile.renameUserProfile('Alice', 'Bob');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Bob', 'Eve']);
		});

		it('should do nothing when renaming a non-existing user profile', function() {
			userProfile.renameUserProfile('Eve', 'Evil');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice', 'Bob']);
		});
	});

	describe('#deleteUserProfile()', function() {
		it('should delete an existing user profile correctly', function() {
			userProfile.deleteUserProfile('Bob');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice']);

			userProfile.addUserProfile('Bob');

			userProfile.deleteUserProfile('Alice');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Bob']);
		});

		it('should do nothing when deleting a non-existing user profile', function() {
			userProfile.deleteUserProfile('Eve');
			assert.deepStrictEqual(jsonStorage.readPreference('users'), ['Alice', 'Bob']);
		});
	});
});