const findDevices = require("local-devices");
const ModbusTcpClient = require("modbusjs").ModbusTcpClient;
const debugModbus = require("debug")("app:modbus");
const FTP = require("ftp");
const ss = require("stream-string");
const parseString = require("xml2js").parseString;
const debug = require("debug")("app:wagoLib");
const axios = require("axios");

// Find all local waog devices in the network
function find() {
  return new Promise((resolve, reject) => {
    findDevices()
      .then(devices => {
        const wagoRegex = /00:30:de/;
        const result = devices.filter(item => {
          return wagoRegex.test(item.mac);
        });

        if (result.length > 0) {
          resolve(result);
        } else {
          reject(new Error("No Wago device found."));
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

// Read out the plc information such as article number and connected modules
function getPlcInformation(plc) {
  return new Promise((resolve, reject) => {
    let plcInformations = plc;
    const modbusTcpClient = new ModbusTcpClient(plc.ip, 502, {
      debug: true,
      autoReconnect: false,
      autoReconnectInterval: 1
    });

    modbusTcpClient
      .connect()
      .then(function() {
        // Read plc Modules and plc Article Number
        modbusTcpClient
          .readHoldingRegisters(8240, 65)
          .then(response => {
            plcInformations["articleNumber"] = "750-" + response.result[0];
            plcInformations["modules"] = response.result.slice(
              1,
              response.result.indexOf(0)
            );
          })
          .then(() => {
            modbusTcpClient
              .disconnect()
              .then(resolve(plcInformations))
              .catch(function(err) {
                debugModbus(
                  "Something broke while disconnecting modbusclient",
                  err
                );
                reject(
                  new Error(
                    "Something broke while disconnecting modbusclient",
                    err
                  )
                );
              });
          })
          .catch(err => {
            debugModbus("Something broke while reading modbus register", err);
            reject(
              new Error("Something broke while reading modbus register", err)
            );
          });
      })
      .catch(err => {
        debugModbus("Modbus client connection failed", err);
        reject(new Error("Modbus client connection failed", err));
      });
  });
}

// Get all available PLC`s in the network with their article number and modules
function getPlcs() {
  return new Promise((resolve, reject) => {
    // find all the Wago PLCs in the network
    find()
      .then(result => {
        const readAllThePlcs = result.map(getPlcInformation);
        let allPlcDetails = Promise.all(readAllThePlcs);
        allPlcDetails
          .then(details => resolve(details))
          .catch(err => reject(err));
      })
      .catch(err => reject(new Error("No Wago device found.")));
  });
}

// read the available XML files from a controller, return the filesnames not the content
function readPlcXmls(plc) {
  return new Promise((resolve, reject) => {
    var ftpClient = new FTP();

    ftpClient.connect({
      host: plc.ip,
      port: 21,
      user: plc.user,
      password: plc.password
    });

    ftpClient.on("error", function(err) {
      debug("readPlcXmls ", err);
      reject(err.message);
    });

    ftpClient.on("ready", function(err) {
      debug("ON");
      if (err) {
        debug(err);
        reject("done");
      } else {
        ftpClient.list("PLC/", function(err, list) {
          if (err) {
            reject(err);
          } else {
            ftpClient.end();
            plc["files"] = list.filter(file => {
              const xmlRegex = /(.xml)/g;
              if (
                xmlRegex.test(file.name) &&
                file.name !== "error_ini.xml" &&
                file.name !== "alm_ini.xml" &&
                file.name !== "visu_ini.xml"
              ) {
                return file.name;
              }
            });

            // remove useless information about the file
            let result = [];
            plc.files.forEach(item => {
              result.push({ name: item.name, size: item.size });
            });

            plc.files = result;

            resolve(plc);
          }
        });
      }
    });
  });
}

// returns the plcs with available XML files
function readAllPlcsXmls(plcs) {
  return new Promise((resolve, reject) => {
    const actions = plcs.map(readPlcXmls);
    let allPlcsXmlFiles = Promise.all(actions);
    allPlcsXmlFiles.then(details => resolve(details)).catch(err => reject(err));
  });
}

// translate xml visu paramter into an object which include the arti adress for the endpoint
function generateArtiAdresses(xmlVisuVars) {
  const noArtiAdress = function(item) {
    return !item.hasOwnProperty("_");
  };
  const noName = function(item) {
    return !item.hasOwnProperty("$");
  };

  try {
    if (!Array.isArray(xmlVisuVars)) {
      return new Error("Invalid XML Array.");
    } else {
      if (xmlVisuVars.some(noArtiAdress))
        return new Error("Invalid XML Object detected - no Arti Adress");
      if (xmlVisuVars.some(noName))
        return new Error("Invalid XML Object detected - no name");

      return xmlVisuVars.map(item => {
        let visuVar = {};
        visuVar["datatype"] = item._.split(",")[3];
        visuVar["arti"] = item._.replace(/,/g, "|");
        visuVar["prgName"] = item.$.name.split(".")[0];
        visuVar["varName"] = item.$.name.split(".")[1];
        return visuVar;
      });
    }
  } catch (err) {
    return new Error("Something failed while Arti adress generation.", err);
  }
}

// Get a specific xml file from a plc and check if the files has a visu var list
function getPlcXmlFileData(plc, xmlFile) {
  return new Promise((resolve, reject) => {
    if (!xmlFile) {
      reject(new Error("No XML passed."));
    }

    if (xmlFile.search(".xml") === -1) {
      reject(new Error("Invalid XML file."));
    } else {
      var ftpClient = new FTP();
      ftpClient.connect({
        host: plc.ip,
        port: 21,
        user: plc.user,
        password: plc.password
      });

      ftpClient.on("error", function(err) {
        debug("getPlcXmlFileData ", err);
        reject(err.message);
      });

      ftpClient.on("ready", function() {
        ftpClient.get("PLC/" + xmlFile, function(err, stream) {
          if (err) {
            reject(
              new Error("Something broke while receiving XML Data via ftp.")
            );
          } else {
            stream.once("close", function() {
              ftpClient.end();
            });
            // use stream-string to convert the stream in a string var
            ss(stream)
              .then(data => {
                // Check if the XML File has a variablelist entry and only resolve this list
                parseString(data, function(err, result) {
                  if (err) {
                    reject(
                      new Error(
                        "Something broke while conerting data stram into object."
                      )
                    );
                  } else {
                    // check if visu vars are available or not
                    if (result.visualisation.hasOwnProperty("variablelist")) {
                      resolve(result.visualisation.variablelist[0].variable);
                    } else {
                      reject(new Error("No variables found."));
                    }
                  }
                });
              })
              .catch(err => {
                // stream emitted an error event (err), so the promise from stream-string was rejected
                reject(
                  new Error("Something broke while streaming data - " + err)
                );
              });
          }
        });
      });
    }
  });
}

// get all the available visu vars from a given plc
function getAllPlcXmlData(plc) {
  return new Promise((resolve, reject) => {
    const actions = plc.files.map(file => {
      return getPlcXmlFileData(plc, file.name);
    });
    let allResults = Promise.all(actions);
    allResults
      .then(filesWithVisuVarArray => {
        filesWithVisuVarArray.forEach((visuVarArray, index) => {
          plc.files[index].variables = generateArtiAdresses(visuVarArray);
          resolve(plc);
        });
        resolve(plc);
      })
      .catch(err => reject(err));
  });
}

function getPlcDetails(plc) {
  return new Promise((resolve, reject) => {
    if (!plc) {
      reject(new Error("Invalid PLC"));
    } else {
      if (
        plc.hasOwnProperty("ip") &&
        plc.hasOwnProperty("user") &&
        plc.hasOwnProperty("password")
      ) {
        if (plc.user === "" || plc.password === "") {
          reject(new Error("Invalid PLC"));
        } else {
          readPlcXmls(plc)
            .then(plcXml => {
              getAllPlcXmlData(plcXml)
                .then(result => {
                  delete result.user;
                  delete result.password;

                  resolve(result);
                })
                .catch(err =>
                  reject(
                    new Error("Something broke while receiving XML data.", err)
                  )
                );
            })
            .catch(err => reject(err));
        }
      } else {
        reject(new Error("Invalid PLC"));
      }
    }
  });
}

// prepare the post request string for reading the data
function createArtiReadCommand(plc) {
  if (!plc) {
    return new Error("Invalid plc.");
  } else {
    if (!plc.files) {
      return new Error("Invalid plc files.");
    } else {
      if (plc.files.length === 0) {
        return plc;
      } else {
        //TODO: Check if each file variable contains an arti
        plc.files.forEach((file, indexFile) => {
          let command = "|0|";

          command += file.variables.length + "|";

          file.variables.forEach((variable, indexVariable) => {
            command += indexVariable + "|" + variable.arti + "|";
          });
          debug(command);
          plc.files[indexFile].artiReadCommand = command;
        });

        return plc;
      }
    }
  }
}

function getArtiValuesFromPlc(plc) {
  return new Promise((resolve, reject) => {
    plc.files.forEach((file, fileIndex) => {
      axios({
        method: "post",
        url: "http://" + plc.ip + "/plc/webvisu.htm",
        data: file.artiReadCommand
      })
        .then(response => {
          const data = response.data
            .substring(1, response.data.length - 1)
            .split("|");

          plc.files[fileIndex].variables = plc.files[fileIndex].variables.map(
            (variable, varIndex) => {
              variable.value = data[varIndex];
              return variable;
            }
          );

          resolve(plc);
        })
        .catch(err => {
          debug(err);
          reject(new Error("Something broke while receiving plc data.", err));
        });
    });
  });
}

module.exports.find = find;
module.exports.getPlcInformation = getPlcInformation;
module.exports.getPlcs = getPlcs;
module.exports.readPlcXmls = readPlcXmls;
module.exports.readAllPlcsXmls = readAllPlcsXmls;
module.exports.generateArtiAdresses = generateArtiAdresses;
module.exports.getPlcXmlFileData = getPlcXmlFileData;
module.exports.getAllPlcXmlData = getAllPlcXmlData;
module.exports.getPlcDetails = getPlcDetails;
module.exports.createArtiReadCommand = createArtiReadCommand;
module.exports.getArtiValuesFromPlc = getArtiValuesFromPlc;
