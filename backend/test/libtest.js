const wago = require("../lib/wago");

const controller = [
  {
    name: "750-830",
    ip: "192.168.1.10",
    mac: "unknown",
    user: "admin",
    password: "wago"
  },
  {
    name: "750-831",
    ip: "192.168.1.4",
    mac: "00:30:de:0a:77:2b",
    user: "admin",
    password: "wago"
  }
];

const plc = {
  name: "750-831",
  ip: "192.168.1.4",
  mac: "00:30:de:0a:77:2b",
  user: "admin",
  password: "wago",
  files: [
    {
      name: "plc_visu.xml",
      size: 7225
    },
    {
      name: "testpage.xml",
      size: 1672
    }
  ]
};

wago
  .getVisuVarsFromAllPlcs(controller)
  .then(res => console.log(res[1].visuVars))
  .catch(err => console.log(err));
