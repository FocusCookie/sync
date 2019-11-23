const debug = require("debug")("app:wagoController");
const { Wago, validate } = require("../models/wago");
var objectID = require("mongodb").ObjectID;

module.exports.createWago = function(plc) {
  return new Promise((resolve, reject) => {
    const validation = validate(plc);
    if (validation.error) return reject(validation);

    Wago.find({ ip: plc.ip })
      .then(existingPlc => {
        if (existingPlc.length !== 0) {
          reject(`${plc.ip} is already registered.`);
        } else {
          const newPlc = new Wago(plc);
          newPlc
            .save()
            .then(result => {
              debug(`PLC with IP ${plc.ip} stored.`);
              debug(result);
              resolve(result);
            })
            .catch(err => {
              debug("Error while storing Wago PLC in database.");
              debug(err);
              reject(
                new Error(
                  "Something broke while storing Wago PLC in database.",
                  err
                )
              );
            });
        }
      })
      .catch(err => {
        debug(err);
        reject(
          new Error("Something broke while storing Wago PLC in database.", err)
        );
      });
  });
};

module.exports.editWago = function(id, plc) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      const validation = validate(plc);

      if (validation.error) {
        reject(validation);
      } else {
        Wago.findOne({ _id: id }).then(existingPlc => {
          debug(existingPlc);
          if (!existingPlc) {
            reject(new Error(`No PLC found with ID: ${id}`));
          } else {
            Wago.findOne({ ip: plc.ip })
              .then(existingIp => {
                if (!existingIp) {
                  Wago.findOneAndUpdate({ _id: id }, plc)
                    .then(update => {
                      update.save().then(() => {
                        Wago.findOne({ _id: id }).then(result => {
                          resolve(result);
                        });
                      });
                    })
                    .catch(err => {
                      debug("Something broke while updating PLC", err);
                      reject(new Error("Something broke while updating PLC"));
                    });
                } else {
                  if (existingIp._id.toString() !== id) {
                    reject(new Error(`${plc.ip} is already registered.`));
                  }
                }
              })
              .catch(err => {
                debug(err);
                reject(
                  new Error(
                    "Something broke while storing Wago PLC in database.",
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

module.exports.deleteWago = function(id) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      Wago.findOne({ _id: id }).then(existingPlc => {
        debug(existingPlc);
        if (!existingPlc) {
          reject(new Error(`No PLC found with ID: ${id}`));
        } else {
          Wago.deleteOne({ _id: id })
            .then(() => {
              resolve(`Successfully deleted PLC with ID: ${id}`);
            })
            .catch(err => {
              reject(
                new Error(
                  `Something broke while deleting PLC with ID: ${id}`,
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
