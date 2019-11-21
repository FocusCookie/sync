const debug = require("debug")("app:wagoController");
const { Wago, validate } = require("../models/wago");

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
    const validation = validate(plc);

    if (validation.error) return reject(validation);

    Wago.findOne({ _id: id }).then(existingPlc => {
      if (!existingPlc) {
        reject(`No PLC found with ID: ${id}`);
      } else {
        Wago.findOne({ ip: plc.ip })
          .then(existingIp => {
            if (existingIp) {
              reject(`${plc.ip} is already registered.`);
            } else {
              Wago.findOneAndUpdate({ _id: id }, plc)
                .then(updated => {
                  resolve(updated);
                })
                .catch(err => {
                  debug("Something broke while updating PLC", err);
                  reject(new Error("Something broke while updating PLC"));
                });
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
  });
};
