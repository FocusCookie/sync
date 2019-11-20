const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const wagoLib = require("../lib/wago");
const wagoController = require("../controller/wago");
const { Wago } = require("../models/wago");

// returns available PLC's with ip, mac, hostname, article number and modules
router.get("/search", auth, (req, res) => {
  wagoLib
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
  wagoLib
    .getPlcDetails(plc)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

// returns all PLC'S from database
router.get("/", auth, (req, res) => {
  Wago.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      debug(err);
      res.status(400).send("Something broke while reading database.");
    });
});

// store a PLC to the database, with all the details (ip, name, mac, articlenumber, modules, files)
router.post("/", auth, (req, res) => {
  wagoController
    .createWago(req.body)
    .then(plc => {
      res.send(plc);
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
