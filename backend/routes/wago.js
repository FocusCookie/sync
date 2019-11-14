const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const wago = require("../lib/wago");

// get /allPlcsInNetwerk

router.get("/allPlcsInNetwork", auth, (req, res) => {
  wago
    .getPlcs()
    .then(plcs => {
      res.send(plcs);
    })
    .catch(err => {
      debug(err);
      res.status(400).send(err.message);
    });
});

module.exports = router;
