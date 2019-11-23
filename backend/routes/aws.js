const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const objectID = require("mongodb").ObjectID;
const awsThingsController = require("../controller/awsThings");

router.get("/things", auth, (req, res) => {
  awsThingsController
    .getThings()
    .then(result => res.send(result))
    .catch(err => res.status(400).send(err));
});

router.get("/things/:id", auth, (req, res) => {
  if (objectID.isValid(req.params.id)) {
    awsThingsController
      .getThings(req.params.id)
      .then(result => res.send(result))
      .catch(err => {
        debug(err);
        res.status(400).send(err.message);
      });
  } else {
    res.status(400).send("Invalid ID");
  }
});

router.post("/things", auth, (req, res) => {
  awsThingsController
    .createThing(req.body)
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

router.put("/things/:id", auth, (req, res) => {
  awsThingsController
    .editThing(req.params.id, req.body)
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

router.delete("/things/:id", auth, (req, res) => {
  awsThingsController
    .deleteThing(req.params.id)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      if (err.error) {
        res.status(400).send(err.error.details[0].message);
      } else {
        res.status(400).send(err.message);
      }
    });
});

module.exports = router;
