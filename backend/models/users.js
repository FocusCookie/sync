const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 1024
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	created: { type: Date, default: Date.now }
});

userSchema.methods.generateToken = function() {
	return jwt.sign(
		{ _id: this.id, isAdmin: this.isAdmin },
		config.get("jwtPrivateKey")
	);
};

const User = mongoose.model("User", userSchema);

function validate(user) {
	const schema = Joi.object({
		name: Joi.string()
			.min(3)
			.max(50)
			.required(),
		email: Joi.string()
			.min(5)
			.max(255)
			.required(),
		password: Joi.string()
			.min(5)
			.max(255)
			.required(),
		repeat_password: Joi.ref("password"),
		isAdmin: Joi.boolean()
	});

	return schema.validate(user);
}

module.exports.validate = validate;
module.exports.User = User;
