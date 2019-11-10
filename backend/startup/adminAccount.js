const debug = require("debug")("app:AdminAccount");
const { User } = require("../models/users");
const config = require("config");
const bcrypt = require("bcrypt");

// create admin
User.findOne({ email: "admin@app.com" }).then(exists => {
	if (!exists) {
		const admin = {
			name: "admin",
			email: config.get("adminEmail"),
			password: config.get("adminPassword"),
			repeat_password: config.get("adminPassword"),
			isAdmin: true
		};

		User.find({ email: admin.email })
			.then(existingAdmin => {
				if (existingAdmin.length !== 0) {
					reject(`${user.email} is already registered.`);
				} else {
					const newAdmin = new User(admin);

					bcrypt.genSalt(10).then(salt => {
						bcrypt.hash(newAdmin.password, salt).then(hashedPassword => {
							newAdmin.password = hashedPassword;

							newAdmin
								.save()
								.then(result => {
									debug(`User with email ${newAdmin.email} created`);
									debug(result);
								})
								.catch(err => {
									debug("Error while creating user");
									debug(err);
								});
						});
					});
				}
			})
			.catch(err => {
				throw new Error(err);
			});
	} else {
		debug("Admin email - admin@app.com");
	}
});
