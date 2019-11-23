const debug = require("debug")("app:awsCertController");
const { AwsCert, validate } = require("../models/awsCerts");
const bcrypt = require("bcrypt");
var objectID = require("mongodb").ObjectID;

module.exports.createCerts = function(certs) {
  return new Promise((resolve, reject) => {
    const validation = validate(certs);
    if (validation.error) {
      return reject(validation);
    } else {
      AwsCert.find({ thingName: certs.thingName })
        .then(existingCert => {
          if (existingCert.length !== 0) {
            reject(new Error(`Thing ${certs.thingName} is already registered`));
          } else {
            const newCert = new AwsCert(certs);
            bcrypt.genSalt(10).then(salt => {
              bcrypt.hash(newCert.privateKey, salt).then(hashedPrivateKey => {
                newCert.privateKey = hashedPrivateKey;

                newCert
                  .save()
                  .then(result => {
                    debug(
                      `AWS Certs for thing ${newCert.thingName} successfully created created`
                    );
                    debug(newCert);
                    resolve(result);
                  })
                  .catch(err => {
                    debug(err);
                    reject(
                      new Error(
                        "Something broke while creating AWS Cert - Storing to DB",
                        err
                      )
                    );
                  });
              });
            });
          }
        })
        .catch(err => {
          debug(err);
          reject(new Error("Something broke while creating AWS Cert.", err));
        });
    }
  });
};

module.exports.getCerts = function(id) {
  return new Promise((resolve, reject) => {
    if (id) {
      return AwsCert.findOne({ _id: id })
        .select("-privateKey")
        .then(result => {
          debug("result ", result);
          if (!result) {
            debug("hier");
            reject(new Error("No AWS Certs found with given ID: " + id));
          } else {
            resolve(result);
          }
        })
        .catch(err => {
          resolve(new Error("Something broke while reading DB", err));
        });
    } else {
      return AwsCert.find()
        .select("-privateKey")
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          resolve(new Error("Something broke while reading DB", err));
        });
    }
  });
};

module.exports.editCerts = function(id, certs) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      const validation = validate(certs);

      if (validation.error) {
        reject(validation);
      } else {
        AwsCert.findOne({ _id: id }).then(existingCerts => {
          if (!existingCerts) {
            reject(new Error(`No Certs found with ID: ${id}`));
          } else {
            AwsCert.findOne({ thingName: certs.thingName })
              .then(existingThingWithName => {
                if (existingThingWithName) {
                  if (existingThingWithName._id.toString() !== id) {
                    reject(
                      new Error(`${certs.thingName} is already registered.`)
                    );
                  } else {
                    AwsCert.findOneAndUpdate({ _id: id }, certs)
                      .then(update => {
                        update.save().then(() => {
                          AwsCert.findOne({ _id: id }).then(result => {
                            resolve(result);
                          });
                        });
                      })
                      .catch(err => {
                        debug("Something broke while updating AWS Certs", err);
                        reject(
                          new Error(
                            "Something broke while updating AWS Certs",
                            err
                          )
                        );
                      });
                  }
                } else {
                  AwsCert.findOneAndUpdate({ _id: id }, certs)
                    .then(update => {
                      update.save().then(() => {
                        AwsCert.findOne({ _id: id }).then(result => {
                          resolve(result);
                        });
                      });
                    })
                    .catch(err => {
                      debug("Something broke while updating AWS Certs", err);
                      reject(
                        new Error(
                          "Something broke while updating AWS Certs",
                          err
                        )
                      );
                    });
                }
              })
              .catch(err => {
                debug("id " + id, " ");
                debug(err);
                reject(
                  new Error(
                    "Something broke while updating AWS Cert in database.",
                    err
                  )
                );
              });
          }
        });
      }
    } else {
      reject(new Error("Invalid ID"));
    }
  });
};

module.exports.deleteCerts = function(id) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      AwsCert.findOne({ _id: id }).then(existingCerts => {
        debug(existingCerts);
        if (!existingCerts) {
          reject(new Error(`No AWS Certs found with ID: ${id}`));
        } else {
          AwsCert.deleteOne({ _id: id })
            .then(() => {
              resolve(`Successfully deleted AWS Certs with ID: ${id}`);
            })
            .catch(err => {
              reject(
                new Error(
                  `Something broke while deleting AWS Certs with ID: ${id}`,
                  err
                )
              );
            });
        }
      });
    } else {
      reject(new Error("Invalid ID"));
    }
  });
};
