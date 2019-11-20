const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const wago = require("../lib/wago");

// returns available PLC's with ip, mac, hostname, article number and modules
router.get("/search", auth, (req, res) => {
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

// Post a valid PLC with username and password to get the visuVars from the PLC
router.post("/details", auth, (req, res) => {
  const plc = req.body;
  wago
    .getPlcDetails(plc)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

module.exports = router;
