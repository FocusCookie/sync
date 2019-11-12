const wago = require("../../../lib/wago");
let visuVars;
const expectedResult = [
  { datatype: "0", arti: "4|152|1|0", prgName: "PLC_PRG", varName: "test" },
  { datatype: "1", arti: "4|146|2|1", prgName: "PLC_PRG", varName: "lauf" },
  { datatype: "6", arti: "4|156|4|6", prgName: "PLC_PRG", varName: "zahl" },
  { datatype: "8", arti: "4|624|81|8", prgName: "PLC_PRG", varName: "satz" }
];

describe("Wago.lib - Unittest ", () => {
  beforeEach(() => {
    visuVars = [
      { _: "4,152,1,0", $: { name: "PLC_PRG.test" } },
      { _: "4,146,2,1", $: { name: "PLC_PRG.lauf" } },
      { _: "4,156,4,6", $: { name: "PLC_PRG.zahl" } },
      { _: "4,624,81,8", $: { name: "PLC_PRG.satz" } }
    ];
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
});
