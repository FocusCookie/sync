const wago = require("../lib/wago");

const controller = {
  name: "750-831",
  ip: "192.168.1.4",
  mac: "00:30:de:0a:77:2b",
  user: "admin",
  password: "wago",
  files: [
    {
      type: "-",
      name: "plc_visu.xml",
      target: undefined,
      sticky: false,
      rights: [Object],
      acl: false,
      owner: "owner",
      group: "group",
      size: 7225
    },
    {
      type: "-",
      name: "testpage.xml",
      target: undefined,
      sticky: false,
      rights: [Object],
      acl: false,
      owner: "owner",
      group: "group",
      size: 1672
    }
  ]
};

wago
  .getPlcXmlFile(controller, controller.files[0].name)
  .then(res => console.log(res))
  .catch(err => console.log(err));
