const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Input Validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// User Model
const User = require('../../models/User')

// Register
router.post('/register', (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}

	// Check if email already exits, if not, register new user
	User.findOne({ email: req.body.email })
	.then(user => {
		if (user) {
			errors.email = 'Email already taken.';
			return res.status(400).json(errors);
		} else {
			const avatar = gravatar.url(req.body.email, {
				s:'200', r:'pg', d:'mm'
			});
			const newUser = new User ({
				name: req.body.name,
				email: req.body.email,
				avatar,
				password: req.body.password
			});
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser.save()
						.then(user => res.json(user))
						.catch(err => console.log(err))
				})
			})

		}
	})
});

// Login user with JWT token
router.post('/login', (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;
	// Find user by email
	User.findOne({email})
		.then(user => {
			if (!user) {
				errors.email = 'User not found'
				return res.status(404).json(errors);
			}
		bcrypt.compare(password, user.password)
		.then(isMatch => {
			if (isMatch) {
				const jwtPayload = { id: user.id , name: user.name, avatar: user.avatar}
				jwt.sign(jwtPayload, keys.secretOrKey, {expiresIn: 3600},
					(err, token) => {
						res.json({
							success: true,
							token: 'Bearer ' + token
						});
					});
			} else {
				errors.password = 'Password is incorrect'
				return res.status(400).json(errors);
			}
		});
	});
});

// Return logged user
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
	res.json({
		id: req.user.id,
		name: req.user.name,
		email: req.user.email
	});
});



module.exports = router;