const wago = require("../../../lib/wago");
let visuVars;
let plc;

describe("Wago.lib - Unittest ", () => {
  beforeEach(() => {
    visuVars = [
      { _: "4,152,1,0", $: { name: "PLC_PRG.test" } },
      { _: "4,146,2,1", $: { name: "PLC_PRG.lauf" } },
      { _: "4,156,4,6", $: { name: "PLC_PRG.zahl" } },
      { _: "4,624,81,8", $: { name: "PLC_PRG.satz" } }
    ];

    plc = {
      name: "Bacnet",
      ip: "192.168.1.4",
      mac: "00:30:de:0a:de:1d",
      articleNumber: "750-831",
      modules: [-30719, -31742, 466, 496, -28670],
      files: [
        {
          name: "plc_visu.xml",
          size: 5669,
          variables: [
            {
              datatype: "0",
              arti: "4|152|1|0",
              prgName: "PLC_PRG",
              varName: "test"
            },
            {
              datatype: "1",
              arti: "4|146|2|1",
              prgName: "PLC_PRG",
              varName: "lauf"
            },
            {
              datatype: "6",
              arti: "4|156|4|6",
              prgName: "PLC_PRG",
              varName: "zahl"
            },
            {
              datatype: "8",
              arti: "4|624|81|8",
              prgName: "PLC_PRG",
              varName: "satz"
            }
          ]
        },
        {
          name: "testpage.xml",
          size: 1672,
          variables: [
            {
              datatype: "2",
              arti: "4|615|1|2",
              prgName: "ANOTHERPLC",
              varName: "anotherValue"
            }
          ]
        }
      ]
    };
  });

  describe("generateArtiAdresses", () => {
    it("should return a valid arti adress object if the input xmlarray is valid", () => {
      const result = wago.generateArtiAdresses(visuVars);

      expect(result.length).toBe(4);
      expect(result[0]).toHaveProperty("datatype", "0");
      expect(result[0]).toHaveProperty("arti", "4|152|1|0");
      expect(result[0]).toHaveProperty("prgName", "PLC_PRG");
      expect(result[0]).toHaveProperty("varName", "test");
      expect(result[3]).toHaveProperty("datatype", "8");
      expect(result[3]).toHaveProperty("arti", "4|624|81|8");
      expect(result[3]).toHaveProperty("prgName", "PLC_PRG");
      expect(result[3]).toHaveProperty("varName", "satz");
    });

    it("should return an array error if the passed Object is not an valid array", () => {
      const result = wago.generateArtiAdresses(123);

      expect(result.message).toMatch(/Invalid XML Array/);
    });

    it("should return an no Arti Adress error if the passed Object is not an valid array", () => {
      delete visuVars[0]._;
      const result = wago.generateArtiAdresses(visuVars);

      expect(result.message).toMatch(/no Arti Adress/);
    });

    it("should return an no name error if the passed Object is not an valid array", () => {
      delete visuVars[2].$;
      const result = wago.generateArtiAdresses(visuVars);

      expect(result.message).toMatch(/no name/);
    });
  });

  describe("createArtiReadCommand", () => {
    it("should return an invalid plc error if no plc is passed", () => {
      const result = wago.createArtiReadCommand();

      expect(result.message).toMatch(/Invalid plc/i);
    });

    it("should return an Invalid plc files error if the passed plc doesnt have a files property", () => {
      delete plc.files;
      const result = wago.createArtiReadCommand(plc);

      expect(result.message).toMatch(/Invalid plc files/i);
    });

    it("should return an the given plc if the files array is empty", () => {
      plc.files = [];
      const result = wago.createArtiReadCommand(plc);

      expect(result.files.length).toBe(0);
    });

    it("should return the plc including for each file an artiReadCommand", () => {
      const result = wago.createArtiReadCommand(plc);

      expect(result.files[0]).toHaveProperty("artiReadCommand");
      expect(result.files[0]).toHaveProperty("artiReadCommand");
    });
  });
});
