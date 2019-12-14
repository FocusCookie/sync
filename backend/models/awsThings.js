const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const thingSchema = new mongoose.Schema({
  thingName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true
  },
  host: {
    type: String,
    minlength: 10,
    maxlength: 255
  },
  certificate: {
    type: String
  },
  caChain: {
    type: String
  },
  privateKey: {
    type: String
  },
  created: { type: Date, default: Date.now }
});

const AwsThing = mongoose.model("AwsThing", thingSchema);

function validate(thing) {
  const schema = Joi.object({
    thingName: Joi.string()
      .min(3)
      .max(255)
      .required(),
    host: Joi.string()
      .min(10)
      .max(255)
      .required(),
    certificate: Joi.string(),
    caChain: Joi.string(),
    privateKey: Joi.string()
  });

  thing = schema.validate(thing);

  return thing;
}

module.exports.validate = validate;
module.exports.AwsThing = AwsThing;
