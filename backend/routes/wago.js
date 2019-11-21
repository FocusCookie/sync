const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const wagoLib = require("../lib/wago");
const wagoController = require("../controller/wago");
const { Wago } = require("../models/wago");
var objectID = require("mongodb").ObjectID;

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

// returns a single PLC from DB based on the id
router.get("/:id", auth, (req, res) => {
  if (objectID.isValid(req.params.id)) {
    Wago.findOne({ _id: req.params.id })
      .then(result => {
        if (!result) {
          res.status(400).send("No PLC found with the id " + req.params.id);
        } else {
          res.send(result);
        }
      })
      .catch(err => {
        debug(err);
        res.status(400).send("Something broke while reading database.");
      });
  } else {
    res.status(400).send("Invalid ID");
  }
});

// returns a single PLC from DB based on the id
router.put("/:id", auth, (req, res) => {
  debug("IP CHECK ", req.body.ip);
  if (objectID.isValid(req.params.id)) {
    if (req.body._id) {
      res.status(400).send("Invalid PLC Object - _id paramter");
    } else {
      wagoController
        .editWago(req.params.id, req.body)
        .then(updated => res.send(updated))
        .catch(err => {
          if (err.error) {
            res.status(400).send(err.error.details[0].message);
          } else {
            res.status(400).send(err);
          }
        });
    }
  } else {
    res.status(400).send("Invalid ID");
  }
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
