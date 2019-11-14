const wago = require("../../../lib/wago");

let plcOne;
let plcTwo;

describe("Hardware Needed! - Wago Libary - Integration", () => {
  beforeEach(async () => {
    plcOne = {
      name: "?",
      ip: "192.168.1.4",
      mac: "00:30:de:0a:77:2b",
      user: "admin",
      password: "wago"
    };
    plcTwo = {
      name: "?",
      ip: "192.168.1.10",
      mac: "00:30:de:0a:de:1d",
      user: "admin",
      password: "wago"
    };
  });

  describe("find", () => {
    it("should return two wago devices with ip 10 and 4 at the end", async () => {
      delete plcOne.user;
      delete plcOne.password;
      delete plcTwo.user;
      delete plcTwo.password;
      const result = await wago.find();

      expect(result).toContainEqual(plcOne);
      expect(result).toContainEqual(plcTwo);
    });
  });

  describe("get plcInformation", () => {
    it("Return the plcOne 750-831 with with 5 modules", async () => {
      const result = await wago.getPlcInformation(plcOne);

      expect(result.articleNumber).toMatch(plcOne.articleNumber);
      expect(result.modules.length).toBe(5);
      expect(result.modules).toEqual(expect.arrayContaining(plcOne.modules));
    });

    it("Return the plcTwo 750-831 with with 2 modules", async () => {
      const result = await wago.getPlcInformation(plcTwo);

      expect(result.articleNumber).toMatch(plcTwo.articleNumber);
      expect(result.modules.length).toBe(2);
      expect(result.modules).toEqual(expect.arrayContaining(plcTwo.modules));
    });
  });

  describe("getPlcs", () => {
    it("should return two PLCs with articlenumber, ip, modules and name", async () => {
      const result = await wago.getPlcs();

      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("articleNumber");
      expect(result[0]).toHaveProperty("modules");
      expect(result[0]).toHaveProperty("mac");
      expect(result[1]).toHaveProperty("name");
      expect(result[1]).toHaveProperty("articleNumber");
      expect(result[1]).toHaveProperty("modules");
      expect(result[1]).toHaveProperty("mac");
    });
  });

  describe("readPlcXmls", () => {
    it("should add the files property with the readed xml files into the given plcs", async () => {
      const plcs = [plcOne, plcTwo];
      const result = await wago.readAllPlcsXmls(plcs);

      expect(result.length).toBe(2);
      expect(result[0]).toHaveProperty("files");
      expect(result[1]).toHaveProperty("files");
    });
  });

  describe("getPlcXmlFileData", () => {
    it("should return a valid xml data object from a plc with a visu.xml", async () => {
      plcOne.files = [
        {
          name: "plc_visu.xml"
        },
        {
          name: "testpage.xml"
        }
      ];
      const result = await wago.getPlcXmlFileData(plcOne, plcOne.files[0].name);

      expect(result.length).toBe(4);
      expect(result[0]).toHaveProperty("_");
      expect(result[0]).toHaveProperty("$");
      expect(result[0].$).toHaveProperty("name");
    });

    it("should return an error when no xmL file name is not provided", async () => {
      await wago
        .getPlcXmlFileData(plcOne)
        .then()
        .catch(err => {
          expect(err.message).toMatch(/No XML passed/);
        });
    });

    it("should return an error when the xml file name is empty", async () => {
      await wago
        .getPlcXmlFileData(plcOne, "")
        .then()
        .catch(err => {
          expect(err.message).toMatch(/No XML passed/);
        });
    });

    it("should return an error when passed file is not an xml", async () => {
      await wago
        .getPlcXmlFileData(plcOne, "a.js")
        .then()
        .catch(err => {
          expect(err.message).toMatch(/Invalid XML file./);
        });
    });
  });

  describe("getAllPlcXmlFiles", () => {
    it("should return an plc object with available visuVars property as converted arti object", async () => {
      const controller = {
        name: "750-831",
        ip: "192.168.1.4",
        mac: "00:30:de:0a:77:2b",
        user: "admin",
        password: "wago",
        files: [
          {
            name: "plc_visu.xml"
          },
          {
            name: "testpage.xml"
          }
        ]
      };

      const result = await wago.getAllPlcXmlData(controller);

      expect(result).toHaveProperty("visuVars");
      expect(result.visuVars.length).toBe(5);
      expect(result.visuVars[0]).toHaveProperty("_");
      expect(result.visuVars[0]).toHaveProperty("$");
      expect(result.visuVars[0].$).toHaveProperty("name");
    });
  });
});
