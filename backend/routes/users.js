require("../startup/database")();
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const debug = require("debug")("app:usersRoutes");
const auth = require("../middleware/auth");
const usersController = require("../controller/users");
const { User } = require("../models/users");

router.get("/me", (req, res) => {
	debug(req.user);
	User.findById(req.user._id)
		.select("-passsword")
		.then(user => {
			res.send(user);
		});
});

router.post("/", auth, (req, res) => {
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
