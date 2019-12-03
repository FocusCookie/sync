const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

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
  intervalId: { type: Number },
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
  const temp = setInterval(() => {
    console.log("Sync ID " + sync._id);
    console.log("interval ID " + temp);
    console.log("time " + sync.interval);
  }, sync.interval);

  const result = {
    synchronisationId: sync._id,
    intervalId: temp,
    intervalTime: sync.interval
  };

  synchronisationSetIntervals.push(result);

  return result;
}

function getIntervals() {
  return synchronisationSetIntervals;
}

function deleteInterval(syncId) {
  const toDelete = synchronisationSetIntervals.find(
    element => element.synchronisationId === syncId
  );
  const toDeleteIndex = synchronisationSetIntervals.findIndex(
    element => element.synchronisationId === syncId
  );

  clearInterval(toDelete.intervalId);
  synchronisationSetIntervals.splice(toDeleteIndex, 1);
  return synchronisationSetIntervals;
}

module.exports.validate = validate;
module.exports.Synchronisation = Synchronisation;
