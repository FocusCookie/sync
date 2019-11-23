const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const objectID = require("mongodb").ObjectID;
const awsCertController = require("../controller/awsCert");

router.get("/certs", auth, (req, res) => {
  awsCertController
    .getCerts()
    .then(result => res.send(result))
    .catch(err => res.status(400).send(err));
});

router.get("/certs/:id", auth, (req, res) => {
  if (objectID.isValid(req.params.id)) {
    awsCertController
      .getCerts(req.params.id)
      .then(result => res.send(result))
      .catch(err => {
        debug(err);
        res.status(400).send(err.message);
      });
  } else {
    res.status(400).send("Invalid ID");
  }
});

router.post("/certs", auth, (req, res) => {
  awsCertController
    .createCerts(req.body)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      if (err.error) {
        res.status(400).send(err.error);
      } else {
        res.status(400).send(err.message);
      }
    });
});

router.delete("/certs/:id", auth, (req, res) => {
  //TODO: integrate deletion
});

module.exports = router;
