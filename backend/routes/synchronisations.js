const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:wagoRoutes");
const synchronisationsController = require("../controller/synchronisations");

router.get("/", auth, (req, res) => {
  synchronisationsController
    .getSynchronisations()
    .then(result => res.send(result))
    .catch(err => res.status(400).send(err));
});

router.get("/:id", auth, (req, res) => {
  synchronisationsController
    .getSynchronisations(req.params.id)
    .then(result => res.send(result))
    .catch(err => {
      if (err.error) {
        res.status(400).send(err.error);
      } else {
        res.status(400).send(err.message);
      }
    });
});

router.post("/", auth, (req, res) => {
  synchronisationsController
    .createSynchronisation(req.body)
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

router.put("/:id", auth, (req, res) => {
  synchronisationsController
    .editSynchronisation(req.params.id, req.body)
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

router.delete("/:id", auth, (req, res) => {
  synchronisationsController
    .deleteSynchronisation(req.params.id)
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

module.exports = router;
