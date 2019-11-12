const findDevices = require("local-devices");
const ModbusTcpClient = require("modbusjs").ModbusTcpClient;
const debugModbus = require("debug")("app:modbus");
const FTP = require("ftp");

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

function readPlcXmls(plc) {
  return new Promise((resolve, reject) => {
    var ftpClient = new FTP();
    ftpClient.connect({
      host: plc.ip,
      port: 21,
      user: plc.user,
      password: plc.password
    });
    ftpClient.on("ready", function() {
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
          resolve(plc);
        }
      });
    });
  });
}

function readAllPlcsXmls(plcs) {
  return new Promise((resolve, reject) => {
    // find all the Wago PLCs in the network
    const actions = plcs.map(readPlcXmls);
    let allPlcsXmlFiles = Promise.all(actions);
    allPlcsXmlFiles.then(details => resolve(details)).catch(err => reject(err));
  });
}

const visuVarsObject = [
  { _: "4,152,1,0", $: { name: "PLC_PRG.test" } },
  { _: "4,146,2,1", $: { name: "PLC_PRG.lauf" } },
  { _: "4,156,4,6", $: { name: "PLC_PRG.zahl" } },
  { _: "4,624,81,8", $: { name: "PLC_PRG.satz" } }
];

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

module.exports.find = find;
module.exports.getPlcInformation = getPlcInformation;
module.exports.getPlcs = getPlcs;
module.exports.readPlcXmls = readPlcXmls;
module.exports.readAllPlcsXmls = readAllPlcsXmls;
module.exports.generateArtiAdresses = generateArtiAdresses;
