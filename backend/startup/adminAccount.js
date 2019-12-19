const debug = require("debug")("app:startupAdminAccount");
const { User } = require("../models/users");
const config = require("config");
const bcrypt = require("bcrypt");

// create admin
module.exports = async function() {
  User.findOne({ email: "admin@app.com" }).then(exists => {
    if (!exists) {
      const admin = {
        name: "admin",
        email: config.get("adminEmail"),
        password: config.get("adminPassword"),
        repeat_password: config.get("adminPassword"),
        isAdmin: true
      };

      const newAdmin = new User(admin);

      bcrypt.genSalt(10).then(salt => {
        bcrypt.hash(newAdmin.password, salt).then(hashedPassword => {
          newAdmin.password = hashedPassword;

          newAdmin
            .save()
            .then(result => {
              debug(`User with email ${newAdmin.email} created`);
              debug(result);
            })
            .catch(err => {
              debug("Error while creating user");
              debug(err);
            });
        });
      });
    } else {
      debug("Admin email - admin@app.com");
    }
  });
};
