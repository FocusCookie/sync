const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const debug = require("debug")("app:syncController");
var objectID = require("mongodb").ObjectID;
const AWS = require("aws-iot-device-sdk");
const { AwsThing } = require("./awsThings");
const wagoLib = require("../lib/wago");
const { Wago } = require("../models/wago");

let synchronisationSetIntervals = [];

const synchronisationSchema = new mongoose.Schema({
  plcId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  cloudProvider: {
    type: String,
    minlength: 3,
    maxlength: 20,
    required: true
  },
  cloudOptionsId: {
    type: mongoose.Schema.Types.ObjectId
  },
  interval: {
    type: Number,
    min: 1000,
    required: true
  },
  intervalInstance: { type: Number },
  status: {
    type: Boolean,
    default: false
  },
  created: { type: Date, default: Date.now }
});

const Synchronisation = mongoose.model(
  "Synchronisation",
  synchronisationSchema
);

function validate(synchronisation) {
  const schema = Joi.object({
    plcId: Joi.objectId().required(),
    cloudProvider: Joi.string()
      .min(3)
      .max(20)
      .required(),
    cloudOptionsId: Joi.objectId().required(),
    interval: Joi.number()
      .min(1000)
      .required()
  });

  return schema.validate(synchronisation);
}

function createIntervalInstance(sync) {
  return new Promise((resolve, reject) => {
    if (
      objectID.isValid(sync._id) &&
      objectID.isValid(sync.plcId) &&
      objectID.isValid(sync.cloudOptionsId)
    ) {
      let config;

      AwsThing.findOne({
        _id: sync.cloudOptionsId
      })
        .then(cloudOptions => {
          config = {
            keyPath: cloudOptions.privateKey,
            certPath: cloudOptions.certificate,
            caPath: cloudOptions.caChain,
            clientId: cloudOptions.thingName,
            host: cloudOptions.host
          };

          Wago.findOne({ _id: sync.plcId })
            .then(plc => {
              if (sync.cloudProvider === "aws") {
                const thingsInstance = AWS.device(config);

                thingsInstance.on("connect", () => {
                  debug(
                    `[AWS Instance]: for SyncId: ${sync._id}  is connected.`
                  );
                });

                thingsInstance.on("error", () => {
                  debug(`[AWS Instance]: for SyncId: ${sync._id} error:`, err);
                });

                const temp = setInterval(() => {
                  wagoLib
                    .getArtiValuesFromPlc(plc)
                    .then(plcWithValues => {
                      debug("Wago Values");
                      plcWithValues.files.forEach(file => {
                        file.variables.forEach(variable => {
                          if (variable.prgName) {
                            debug(
                              config.clientId +
                                "/" +
                                variable.prgName +
                                "/" +
                                variable.varName,
                              JSON.stringify({ value: variable.value })
                            );
                            thingsInstance.publish(
                              config.clientId +
                                "/" +
                                variable.prgName +
                                "/" +
                                variable.varName,
                              JSON.stringify({ value: variable.value })
                            );
                          } else {
                            debug(
                              config.clientId + "/" + variable.varName,
                              JSON.stringify({ value: variable.value })
                            );
                            thingsInstance.publish(
                              config.clientId + "/" + variable.varName,
                              JSON.stringify({ value: variable.value })
                            );
                          }
                        });
                      });
                    })
                    .catch(err => {
                      debug("Something broke while receiving PLC data", err);
                    });
                }, sync.interval);

                const result = {
                  synchronisationId: sync._id,
                  intervalInstance: temp,
                  intervalTime: sync.interval,
                  thingsInstance: thingsInstance
                };

                synchronisationSetIntervals.push(result);

                debug(
                  "Created instance for SyncId: " +
                    sync._id +
                    " AWS Thing " +
                    config.clientId
                );
                resolve(result);
              } else {
                resolve(null);
              }
            })
            .catch(err => {
              debug("Something broke while checking PLC of Sync", err);
              reject(new Error("Something broke while checking PLC of Sync"));
            });
        })
        .catch(err => {
          debug("Thing findOne broke ", err);
          reject(new Error("Something broke while checking cloud options "));
        });
    } else {
      debug("Invalid snynchronisation, plc or cloudOptions id.");
      reject(new Error("Invalid snynchronisation, plc or cloudOptions id."));
    }
  });
}

function getIntervals() {
  return synchronisationSetIntervals;
}

function deleteInterval(syncId) {
  const toDelete = synchronisationSetIntervals.find(element => {
    return element.synchronisationId.toString() === syncId;
  });
  const toDeleteIndex = synchronisationSetIntervals.findIndex(
    element => element.synchronisationId === syncId
  );
  debug(synchronisationSetIntervals);
  debug("ID", syncId);

  toDelete.thingsInstance.removeListener("connect", () => {
    debug(`[AWS Instance]: for SyncId: ${sync._id}  is connected.`);
  });
  toDelete.thingsInstance.removeListener("error", () => {
    debug(`[AWS Instance]: for SyncId: ${sync._id} error:`, err);
  });

  delete toDelete.thingsInstance;

  clearInterval(toDelete.intervalInstance);
  debug("before", synchronisationSetIntervals);

  synchronisationSetIntervals.splice(toDeleteIndex, 1);
  debug("after", synchronisationSetIntervals);

  return synchronisationSetIntervals;
}

module.exports.validate = validate;
module.exports.Synchronisation = Synchronisation;
module.exports.createIntervalInstance = createIntervalInstance;
module.exports.getIntervals = getIntervals;
module.exports.deleteInterval = deleteInterval;
