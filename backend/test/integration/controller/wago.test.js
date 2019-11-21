const { Wago } = require("../../../models/wago");
const wagoController = require("../../../controller/wago");

let server;
let plcWithDetails;
let storedPlc;

describe("Wago controller - integration test", () => {
  beforeEach(async () => {
    server = require("../../../app");
    plcWithDetails = {
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
    storedPlc = new Wago(plcWithDetails);
    await storedPlc.save();
    plcWithDetails.ip = "192.168.1.1";
  });

  afterEach(async () => {
    await server.close();
    await Wago.deleteMany({});
  });

  describe("createWago", () => {
    afterEach(async () => {
      await Wago.deleteMany({});
    });

    it("should return an error if the given ip is already registered in an existing plc", async () => {
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toMatch(/already/i);
        });
    });

    it("should return the plc with an _id property if it is scuccessfully stored in db", async () => {
      wagoController
        .createWago(plcWithDetails)
        .then(result => expect(result).toHaveProperty("_id"));
    });

    it("should return an required ip error if ip is not given", async () => {
      delete plcWithDetails.ip;
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/"ip" is required/);
          expect(err.value).not.toHaveProperty("ip");
        });
    });

    it("should return an required ip error if ip is empty", async () => {
      plcWithDetails.ip = "";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/empty/);
        });
    });

    it("should return an min error if ip less than 7 digits", async () => {
      plcWithDetails.ip = "1";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if ip is longer than 15 digits", async () => {
      plcWithDetails.ip = "1234567890123456";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an min error if name less than 3 digits", async () => {
      plcWithDetails.name = "a";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an error when name has more than 255 chars", async () => {
      plcWithDetails.name =
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].type).toMatch(/max/);
        });
    });

    it("should return an min error if mac less than 17 digits", async () => {
      plcWithDetails.mac = "AA";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if mac is longer than 15 digits", async () => {
      plcWithDetails.mac = "AA:AA:AA:AA:AA:AAA";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an min error if articleNumber less than 7 digits", async () => {
      plcWithDetails.articleNumber = "1";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if articleNumber is longer than 50 digits", async () => {
      plcWithDetails.articleNumber =
        "AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA";
      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an validation error if modules is not an array", async () => {
      plcWithDetails.modules = 123;

      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be an array/);
        });
    });

    it("should return an validation error if files is not an array", async () => {
      plcWithDetails.files = 123;

      wagoController
        .createWago(plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be an array/);
        });
    });
  });

  describe("editWago", () => {
    it("should edit return the edit plc if id and plc are valid", async () => {
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then(result => {
          expect(result.ip).toBe(plcWithDetails.ip);
        });
    });

    it("should return an error id is invalid", async () => {
      await wagoController
        .editWago("a", plcWithDetails)
        .then()
        .catch(err => {
          expect(err.message).toMatch(/invalid/i);
        });
    });

    it("should return an error if the given ip is already registered in an existing plc", async () => {
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toMatch(/already/i);
        });
    });

    it("should return an required ip error if ip is not given", async () => {
      delete plcWithDetails.ip;
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/"ip" is required/);
          expect(err.value).not.toHaveProperty("ip");
        });
    });

    it("should return an required ip error if ip is empty", async () => {
      plcWithDetails.ip = "";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/empty/);
        });
    });

    it("should return an min error if ip less than 7 digits", async () => {
      plcWithDetails.ip = "1";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if ip is longer than 15 digits", async () => {
      plcWithDetails.ip = "1234567890123456";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an min error if name less than 3 digits", async () => {
      plcWithDetails.name = "a";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an error when name has more than 255 chars", async () => {
      plcWithDetails.name =
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].type).toMatch(/max/);
        });
    });

    it("should return an min error if mac less than 17 digits", async () => {
      plcWithDetails.mac = "AA";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if mac is longer than 15 digits", async () => {
      plcWithDetails.mac = "AA:AA:AA:AA:AA:AAA";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an min error if articleNumber less than 7 digits", async () => {
      plcWithDetails.articleNumber = "1";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be at least/);
        });
    });

    it("should return an max error if articleNumber is longer than 50 digits", async () => {
      plcWithDetails.articleNumber =
        "AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA";
      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(
            /must be less than or equal to/
          );
        });
    });

    it("should return an validation error if modules is not an array", async () => {
      plcWithDetails.modules = 123;

      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be an array/);
        });
    });

    it("should return an validation error if files is not an array", async () => {
      plcWithDetails.files = 123;

      await wagoController
        .editWago(storedPlc._id, plcWithDetails)
        .then()
        .catch(err => {
          expect(err).toHaveProperty("error");
          expect(err.error.details[0].message).toMatch(/must be an array/);
        });
    });
  });

  describe("deleteWago", () => {
    it("should return an error if id is invalid", async () => {
      await wagoController
        .deleteWago("a")
        .then()
        .catch(err => {
          expect(err.message).toMatch(/invalid/i);
        });
    });

    it("should return an error if no plc is found with the given id", async () => {
      await wagoController
        .deleteWago("5dd65bccd4387dc776cdAAAA")
        .then()
        .catch(err => {
          expect(err.message).toMatch(/No PLC found/i);
        });
    });

    it("should return a success message if deletion was successfully", async () => {
      await wagoController
        .deleteWago(storedPlc._id.toString())
        .then(result => expect(result).toMatch(/Successfully/i));
    });
  });
});
