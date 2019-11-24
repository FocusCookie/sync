const debug = require("debug")("app:synchronisationsController");
const { Synchronisation, validate } = require("../models/synchronisations");
const { Wago } = require("../models/wago");
const { AwsThing } = require("../models/awsThings");

module.exports.createSynchronisation = function(synchronisation) {
  return new Promise((resolve, reject) => {
    const validation = validate(synchronisation);
    if (validation.error) {
      return reject(validation);
    } else {
      // check if plcId is already used in a sync
      Synchronisation.findOne({ plcId: synchronisation.plcId })
        .then(plcIdisUsed => {
          if (plcIdisUsed) {
            debug("Given PLC ID: " + synchronisation.plcId);
            debug("Found PLC ID with PLC ID: " + plcIdisUsed);
            reject(
              new Error(
                `PLC ID ${synchronisation.plcId} is already used in another synchronisation.`
              )
            );
          } else {
            Wago.findOne({ _id: synchronisation.plcId })
              .then(plcExists => {
                if (!plcExists) {
                  reject(
                    new Error(`No PLC found with ID ${synchronisation.plcId}`)
                  );
                } else {
                  Synchronisation.findOne({
                    cloudOptionsId: synchronisation.cloudOptionsId
                  })
                    .then(cloudOptionsIsUsed => {
                      if (cloudOptionsIsUsed) {
                        reject(
                          new Error(
                            `Cloud options ID ${synchronisation.cloudOptionsId} is already used in another synchronisation`
                          )
                        );
                      } else {
                        AwsThing.findOne({
                          _id: synchronisation.cloudOptionsId
                        }).then(thingExists => {
                          if (!thingExists) {
                            reject(
                              new Error(
                                `No AWS Thing found with ID ${synchronisation.cloudOptionsId}.`
                              )
                            );
                          } else {
                            const newSynchronisation = new Synchronisation(
                              synchronisation
                            );
                            newSynchronisation
                              .save()
                              .then(storedSynchronisation => {
                                resolve(storedSynchronisation);
                              })
                              .catch(err => {
                                debug(err);
                                reject(
                                  new Error(
                                    "Somehing broke while storing synchronisation"
                                  )
                                );
                              });
                          }
                        });
                      }
                    })
                    .catch(err => {
                      debug(err);
                      reject(
                        new Error(
                          "Something broke while checking Cloud Options ID."
                        )
                      );
                    });
                }
              })
              .catch(err => {
                debug(err);
                reject(
                  new Error("Something broke while checking if PLC exists.")
                );
              });
          }
        })
        .catch(err => {
          debug(err);
          reject(new Error("Something broke while checking PLC ID."));
        });
    }
  });
};
