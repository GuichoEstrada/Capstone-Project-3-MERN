const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput (data) {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : '';
	data.email = !isEmpty(data.email) ? data.email : '';
	data.password = !isEmpty(data.password) ? data.password : '';
	data.confirmpass = !isEmpty(data.confirmpass) ? data.confirmpass : '';

	// Name validator
	if(!Validator.isLength(data.name, {min:2, max:30})) {
		errors.name = 'Name must be between 2 and 30 characters';
	}
	if(Validator.isEmpty(data.name)) {
		errors.name = 'Name field is required';
	}

	// Email Validator
	if(Validator.isEmpty(data.email)) {
		errors.email = 'Email field is required';
	}
	if(!Validator.isEmail(data.email)) {
		errors.email = 'Email is invalid';
	}

	// Password Validator
	if(Validator.isEmpty(data.password)) {
		errors.password = 'Password field is required';
	}
	if(!Validator.isLength(data.password, { min: 8, max: 30 })) {
		errors.password = 'Password must at least be 6 characters.';
	}
	if(Validator.isEmpty(data.confirmpass)) {
		errors.confirmpass = 'Please confirm your password';
	}
	if(!Validator.equals(data.password, data.confirmpass)) {
		errors.confirmpass = 'Passwords do not match';
	}

	return {
		errors,
		isValid: isEmpty(errors)
	}
}