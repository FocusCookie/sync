require("../startup/database")();
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const debug = require("debug")("app:usersRoutes");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const usersController = require("../controller/users");
const { User } = require("../models/users");

router.get("/me", auth, (req, res) => {
	debug(req.user._id);
	User.findById(req.user._id)
		.select("-passsword")
		.then(user => {
			if (!user) {
				res.status(400).send("Invalid Token.");
			} else {
				res.send(user);
			}
		});
});

router.post("/", [auth, admin], (req, res) => {
	usersController
		.createUser(req.body)
		.then(user => {
			res
				.header("x-auth-token", user.generateToken())
				.send(_.pick(user, ["_id", "name", "email"]));
		})
		.catch(err => {
			if (err.error) {
				res.status(400).send(err.error.details[0].message);
			} else {
				res.status(400).send(err);
			}
		});
});

module.exports = router;
