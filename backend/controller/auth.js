const debug = require("debug");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const { User } = require("../models/users");

function validate(user) {
	const schema = Joi.object({
		email: Joi.string()
			.min(5)
			.max(255)
			.required(),
		password: Joi.string()
			.min(5)
			.max(255)
			.required()
	});

	return schema.validate(user);
}

function login(user) {
	return new Promise((resolve, reject) => {
		const validation = validate(user);
		if (validation.error) return reject(validation);

		User.findOne({ email: user.email }).then(existingUser => {
			if (existingUser) {
				bcrypt
					.compare(user.password, existingUser.password)
					.then(validPassword => {
						if (!validPassword) {
							reject("Invalid email or password.");
						} else {
							const token = jwt.sign(
								{
									_id: existingUser._id,
									isAdmin: existingUser.isAdmin
								},
								config.get("jwtPrivateKey")
							);
							resolve(token);
						}
					});
			} else {
				reject("Invalid email or password.");
			}
		});
	});
}

exports.login = login;
