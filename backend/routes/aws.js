const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const debug = require("debug")("app:awsRoutes");
const objectID = require("mongodb").ObjectID;
const awsThingsController = require("../controller/awsThings");
const multer = require("multer");

// Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "certs/aws");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      new Date().toISOString() +
        "_" +
        req.body.thingName +
        "_" +
        file.originalname
    );
  }
});
const fileFilter = (req, file, cb) => {
  debug(file);

  if (
    (file.mimetype === "application/octet-stream" &&
      file.originalname.includes(".pem")) ||
    file.mimetype === "application/x-x509-ca-cert"
  ) {
    cb(null, true);
  } else {
    debug("HIER");
    cb(new Error("Invalid files", false));
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const certsUpload = upload.array("certs", 3);

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
  certsUpload(req, res, err => {
    if (err) {
      return res.status(400).send("Invalid certifications.");
    } else {
      // auto file selectionf
      let privateKey = req.files.find(file => {
        return file.originalname.match(/pem.key$/);
      }).path;
      let certificate = req.files.find(file => {
        return file.originalname.match(/pem.crt$/);
      }).path;
      let caChain = req.files.find(file => {
        return file.originalname.match(/pem$/);
      }).path;

      // create thing to store
      const thing = {
        thingName: req.body.thingName,
        host: req.body.host,
        certificate: certificate,
        caChain: caChain,
        privateKey: privateKey
      };

      awsThingsController
        .createThing(thing)
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
