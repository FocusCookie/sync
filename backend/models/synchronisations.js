const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const debug = require("debug")("app:syncModel");

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

function createInterval(sync) {
  if (!sync || typeof sync !== "object") {
    debug("Something broke while creating synchronisation setInterval");
    return new Error("Invalid synchronisation.");
  } else {
    if (
      !sync.hasOwnProperty("status") ||
      !sync.hasOwnProperty("_id") ||
      !sync.hasOwnProperty("plcId") ||
      !sync.hasOwnProperty("interval") ||
      !sync.hasOwnProperty("cloudProvider") ||
      !sync.hasOwnProperty("cloudOptionsId")
    ) {
      debug(
        "Some synchronisation property is missing while creating synchronisation setInterval",
        sync
      );
      return new Error("Invalid synchronisation.");
    } else {
      if (sync.status === true) {
        debug(
          "Something broke while creating synchronisation status of given sync is true"
        );
        return new Error("Synchronisation is already active.");
      } else {
        const temp = setInterval(() => {
          console.log("Sync ID " + sync._id);
          console.log("interval ID " + temp);
          console.log("time " + sync.interval);
        }, sync.interval);

        const result = {
          synchronisationId: sync._id,
          intervalInstance: temp,
          intervalTime: sync.interval
        };

        synchronisationSetIntervals.push(result);

        return result;
      }
    }
  }
}

function getIntervals() {
  return synchronisationSetIntervals;
}

function deleteInterval(syncId) {
  if (!syncId) {
    return new Error("Invalid synchronisation id.");
  } else {
    const toDelete = synchronisationSetIntervals.find(
      element => element.synchronisationId === syncId
    );
    const toDeleteIndex = synchronisationSetIntervals.findIndex(
      element => element.synchronisationId === syncId
    );

    clearInterval(toDelete.intervalInstance);
    debug("befor", synchronisationSetIntervals);
    synchronisationSetIntervals.splice(toDeleteIndex, 1);
    debug("after", synchronisationSetIntervals);
    return synchronisationSetIntervals;
  }
}

module.exports.validate = validate;
module.exports.Synchronisation = Synchronisation;
module.exports.createInterval = createInterval;
module.exports.getIntervals = getIntervals;
module.exports.deleteInterval = deleteInterval;
