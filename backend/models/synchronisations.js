const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

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

module.exports.validate = validate;
module.exports.Synchronisation = Synchronisation;
