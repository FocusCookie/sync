const debug = require("debug")("app:awsThingController");
const { AwsThing, validate } = require("../models/awsThings");
const bcrypt = require("bcrypt");
var objectID = require("mongodb").ObjectID;

module.exports.createThing = function(thingSchema) {
  return new Promise((resolve, reject) => {
    const validation = validate(thingSchema);
    if (validation.error) {
      return reject(validation);
    } else {
      AwsThing.find({ thingName: thingSchema.thingName })
        .then(existingThing => {
          if (existingThing.length !== 0) {
            reject(
              new Error(`Thing ${thingSchema.thingName} is already registered`)
            );
          } else {
            const newThing = new AwsThing(thingSchema);
            bcrypt.genSalt(10).then(salt => {
              bcrypt.hash(newThing.privateKey, salt).then(hashedPrivateKey => {
                newThing.privateKey = hashedPrivateKey;

                newThing
                  .save()
                  .then(result => {
                    debug(
                      `AWS Thing for thing ${newThing.thingName} successfully created created`
                    );
                    debug(newThing);
                    resolve(result);
                  })
                  .catch(err => {
                    debug(err);
                    reject(
                      new Error(
                        "Something broke while creating AWS Thing - Storing to DB",
                        err
                      )
                    );
                  });
              });
            });
          }
        })
        .catch(err => {
          debug(err);
          reject(new Error("Something broke while creating AWS Thing.", err));
        });
    }
  });
};

module.exports.getThings = function(id) {
  return new Promise((resolve, reject) => {
    if (id) {
      return AwsThing.findOne({ _id: id })
        .select("-privateKey")
        .then(result => {
          debug("result ", result);
          if (!result) {
            debug("hier");
            reject(new Error("No AWS Thing found with given ID: " + id));
          } else {
            resolve(result);
          }
        })
        .catch(err => {
          resolve(new Error("Something broke while reading DB", err));
        });
    } else {
      return AwsThing.find()
        .select("-privateKey")
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          resolve(new Error("Something broke while reading DB", err));
        });
    }
  });
};

module.exports.editThing = function(id, thing) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      const validation = validate(thing);

      if (validation.error) {
        reject(validation);
      } else {
        AwsThing.findOne({ _id: id }).then(existingThing => {
          if (!existingThing) {
            reject(new Error(`No Thing found with ID: ${id}`));
          } else {
            AwsThing.findOne({ thingName: thing.thingName })
              .then(existingThingWithName => {
                if (existingThingWithName) {
                  if (existingThingWithName._id.toString() !== id) {
                    reject(
                      new Error(`${thing.thingName} is already registered.`)
                    );
                  } else {
                    AwsThing.findOneAndUpdate({ _id: id }, thing)
                      .then(update => {
                        update.save().then(() => {
                          AwsThing.findOne({ _id: id }).then(result => {
                            resolve(result);
                          });
                        });
                      })
                      .catch(err => {
                        debug("Something broke while updating AWS Thing", err);
                        reject(
                          new Error(
                            "Something broke while updating AWS Thing",
                            err
                          )
                        );
                      });
                  }
                } else {
                  AwsThing.findOneAndUpdate({ _id: id }, thing)
                    .then(update => {
                      update.save().then(() => {
                        AwsThing.findOne({ _id: id }).then(result => {
                          resolve(result);
                        });
                      });
                    })
                    .catch(err => {
                      debug("Something broke while updating AWS Thing", err);
                      reject(
                        new Error(
                          "Something broke while updating AWS Thing",
                          err
                        )
                      );
                    });
                }
              })
              .catch(err => {
                debug("id " + id, " ");
                debug(err);
                reject(
                  new Error(
                    "Something broke while updating AWS Thing in database.",
                    err
                  )
                );
              });
          }
        });
      }
    } else {
      reject(new Error("Invalid ID"));
    }
  });
};

module.exports.deleteThing = function(id) {
  return new Promise((resolve, reject) => {
    if (objectID.isValid(id)) {
      AwsThing.findOne({ _id: id }).then(existingThing => {
        debug(existingThing);
        if (!existingThing) {
          reject(new Error(`No AWS Thing found with ID: ${id}`));
        } else {
          AwsThing.deleteOne({ _id: id })
            .then(() => {
              resolve(`Successfully deleted AWS Thing with ID: ${id}`);
            })
            .catch(err => {
              reject(
                new Error(
                  `Something broke while deleting AWS Thing with ID: ${id}`,
                  err
                )
              );
            });
        }
      });
    } else {
      reject(new Error("Invalid ID"));
    }
  });
};
