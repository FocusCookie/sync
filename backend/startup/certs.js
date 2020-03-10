const fs = require("fs");
const path = require("path");

// where certs are stored in runtime
const runtimeCertsDirectory = path.join(__dirname, "../certs/aws/");

// define the folder with the test certificates
const testThingCertsDirectory = path.join(__dirname, "../../aws certs/IP 10/");
// read out all the file names in the test certs dir

module.exports = function() {
  fs.readdir(runtimeCertsDirectory, err => {
    if (err)
      throw new Error("Please create projectRoot/backend/certs/aws folder.");
  });
  if (process.env.NODE_ENV === "dev") {
    fs.readdir(testThingCertsDirectory, err => {
      if (err)
        throw new Error(
          "Please add testcertificates into the projectroot/aws certs/IP 10 folder"
        );
    });
  }
};
