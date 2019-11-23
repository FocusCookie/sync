const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const certsSchema = new mongoose.Schema({
  thingName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true
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

const AwsCert = mongoose.model("AwsCert", certsSchema);

function validate(certs) {
  const schema = Joi.object({
    thingName: Joi.string()
      .min(3)
      .max(255)
      .required(),
    certificate: Joi.string().required(),
    caChain: Joi.string().required(),
    privateKey: Joi.string().required()
  });

  certs = schema.validate(certs);

  //TODO: add better detailed error handling, return which file is invalid
  if (!certs.error) {
    if (
      certs.value.certificate.includes("-----BEGIN CERTIFICATE-----") &&
      certs.value.certificate.includes("-----END CERTIFICATE-----") &&
      certs.value.caChain.includes("-----BEGIN CERTIFICATE-----") &&
      certs.value.caChain.includes("-----END CERTIFICATE-----") &&
      certs.value.privateKey.includes("-----BEGIN RSA PRIVATE KEY-----") &&
      certs.value.privateKey.includes("-----END RSA PRIVATE KEY-----")
    ) {
      return certs;
    } else {
      certs.error = "Invalid Certs Files";
      return certs;
    }
  } else {
    return certs;
  }
}

module.exports.validate = validate;
module.exports.AwsCert = AwsCert;
