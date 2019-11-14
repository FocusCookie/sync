const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
require("../startup/database")();

router.post("/", (req, res) => {
  authController
    .login(req.body)
    .then(validLogin => {
      res.send(validLogin);
    })
    .catch(err => res.status(400).send(err));
});

module.exports = router;
