const debug = require("debug")("app:synchronisationsController");
const { Synchronisation, validate } = require("../models/synchronisations");
const { Wago } = require("../models/wago");
const { AwsThing } = require("../models/awsThings");
var objectID = require("mongodb").ObjectID;

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

module.exports.editSynchronisation = function(id, synchronisation) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      Synchronisation.findOne({ _id: id }).then(idFound => {
        if (!idFound) {
          reject(new Error("No Synchronisation found with ID: " + id));
        } else {
          const validation = validate(synchronisation);
          if (validation.error) {
            reject(validation);
          } else {
            // ANFANG
            Synchronisation.findOne({ plcId: synchronisation.plcId })
              .then(plcIdisUsed => {
                if (plcIdisUsed && plcIdisUsed._id.toString() !== id) {
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
                          new Error(
                            `No PLC found with ID ${synchronisation.plcId}`
                          )
                        );
                      } else {
                        Synchronisation.findOne({
                          cloudOptionsId: synchronisation.cloudOptionsId
                        })
                          .then(cloudOptionsIsUsed => {
                            if (
                              cloudOptionsIsUsed &&
                              cloudOptionsIsUsed &&
                              cloudOptionsIsUsed._id.toString() !== id
                            ) {
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
                                  // HIER
                                  Synchronisation.findOneAndUpdate(
                                    { _id: id },
                                    synchronisation
                                  )
                                    .then(update => {
                                      update.save().then(() => {
                                        Synchronisation.findOne({
                                          _id: id
                                        }).then(result => {
                                          resolve(result);
                                        });
                                      });
                                    })
                                    .catch(err => {
                                      debug(
                                        "Something broke while updating Synchronisation",
                                        err
                                      );
                                      reject(
                                        new Error(
                                          "Something broke while updating Synchronisation",
                                          err
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
                        new Error(
                          "Something broke while checking if PLC exists."
                        )
                      );
                    });
                }
              })
              .catch(err => {
                debug(err);
                reject(new Error("Something broke while checking PLC ID."));
              });
            // ENDE
          }
        }
      });
    } else {
      debug("Invalid ID");
      reject(new Error("Invalid ID"));
    }
  });
};

module.exports.getSynchronisations = function(id) {
  return new Promise((resolve, reject) => {
    debug(id);
    if (id) {
      if (objectID.isValid(id)) {
        return Synchronisation.findOne({ _id: id })
          .then(result => {
            if (!result) {
              reject(
                new Error("No Synchronisation found with given ID: " + id)
              );
            } else {
              resolve(result);
            }
          })
          .catch(err => {
            debug(err);
            resolve(
              new Error("Something broke while reading Synchronisation DB", err)
            );
          });
      } else {
        debug("Invalid ID");
        reject(new Error("Invalid ID"));
      }
    } else {
      return Synchronisation.find()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          debug(err);
          reject(
            new Error(
              "Something broke while reading  SynchronisationDB - Without ID",
              err
            )
          );
        });
    }
  });
};

module.exports.deleteSynchronisation = function(id) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      Synchronisation.findOne({ _id: id }).then(existingSynchronisation => {
        debug(existingSynchronisation);
        if (!existingSynchronisation) {
          reject(new Error(`No Synchronisation found with ID: ${id}`));
        } else {
          Synchronisation.deleteOne({ _id: id })
            .then(() => {
              resolve(`Successfully deleted Synchronisation with ID: ${id}`);
            })
            .catch(err => {
              reject(
                new Error(
                  `Something broke while deleting Synchronisation with ID: ${id}`,
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
