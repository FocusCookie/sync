const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const wagoSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 15
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: 255
  },
  mac: {
    type: String,
    minlength: 17,
    maxlength: 17
  },
  modules: {
    type: Array
  },
  files: {
    type: Array
  },
  articleNumber: {
    type: String,
    minlength: 7,
    maxlength: 50
  },
  created: { type: Date, default: Date.now }
});

const Wago = mongoose.model("Wago", wagoSchema);

function validate(plc) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(255),
    ip: Joi.string()
      .min(7)
      .max(15)
      .required(),
    mac: Joi.string()
      .min(17)
      .max(17),
    modules: Joi.array(),
    files: Joi.array(),
    articleNumber: Joi.string()
      .min(7)
      .max(50)
  });

  return schema.validate(plc);
}

module.exports.validate = validate;
module.exports.Wago = Wago;
