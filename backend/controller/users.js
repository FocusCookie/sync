const debug = require("debug")("app:userController");
const { User, validate } = require("../models/users");
const bcrypt = require("bcrypt");

module.exports.createUser = function(user) {
  return new Promise((resolve, reject) => {
    const validation = validate(user);
    if (validation.error) return reject(validation);

    User.find({ email: user.email })
      .then(existingUser => {
        if (existingUser.length !== 0) {
          reject(`${user.email} is already registered.`);
        } else {
          const newUser = new User(user);
          newUser.isAdmin = false;

          bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(newUser.password, salt).then(hashedPassword => {
              newUser.password = hashedPassword;

              newUser
                .save()
                .then(result => {
                  debug(`User with email ${newUser.email} created`);
                  debug(result);
                  resolve(result);
                })
                .catch(err => {
                  debug("Error while creating user");
                  debug(err);
                  reject(err);
                });
            });
          });
        }
      })
      .catch(err => {
        throw new Error(err);
      });
  });
};
