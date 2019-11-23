const debug = require("debug")("app:awsCertController");
const { AwsCert, validate } = require("../models/awsCerts");
const bcrypt = require("bcrypt");

module.exports.createCerts = function(certs) {
  return new Promise((resolve, reject) => {
    const validation = validate(certs);
    if (validation.error) {
      return reject(validation);
    } else {
      AwsCert.find({ thingName: certs.thingName })
        .then(existingCert => {
          if (existingCert.length !== 0) {
            reject(`Thing ${certs.thingName} is already registered`);
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
