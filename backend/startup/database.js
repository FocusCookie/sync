const debug = require("debug")("app:database");
const config = require("config");
const mongoose = require("mongoose");
const { User } = require("../models/users");
const usersController = require("../controller/users");

module.exports = function() {
	mongoose.set("useNewUrlParser", true);
	mongoose.set("useFindAndModify", false);
	mongoose.set("useCreateIndex", true);
	mongoose
		.connect(config.get("database.host"), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true
		})
		.then(() => {
			debug(`Successfully connected to ${"database.host"}`);
		})
		.catch(err => {
			throw new Error("Couldn't connect to MongoDB.", err);
		});
};
