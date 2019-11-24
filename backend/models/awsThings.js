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
    type: String,
    required: true
  },
  caChain: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
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
    certificate: Joi.string().required(),
    caChain: Joi.string().required(),
    privateKey: Joi.string().required()
  });

  thing = schema.validate(thing);

  //TODO: add better detailed error handling, return which file is invalid
  if (!thing.error) {
    if (
      thing.value.certificate.includes("-----BEGIN CERTIFICATE-----") &&
      thing.value.certificate.includes("-----END CERTIFICATE-----") &&
      thing.value.caChain.includes("-----BEGIN CERTIFICATE-----") &&
      thing.value.caChain.includes("-----END CERTIFICATE-----") &&
      thing.value.privateKey.includes("-----BEGIN RSA PRIVATE KEY-----") &&
      thing.value.privateKey.includes("-----END RSA PRIVATE KEY-----")
    ) {
      return thing;
    } else {
      thing.error = "Invalid thing Files";
      return thing;
    }
  } else {
    return thing;
  }
}

module.exports.validate = validate;
module.exports.AwsThing = AwsThing;
