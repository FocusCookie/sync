const { AwsThing } = require("../../../models/awsThings");
const awsThingsController = require("../../../controller/awsThings");
const { Wago } = require("../../../models/wago");
const wagoController = require("../../../controller/wago");
const { Synchronisation } = require("../../../models/synchronisations");
const synchronisationController = require("../../../controller/synchronisations");

let server;

// AWS Thing
let awsThingPrivateKey;
let awsThingCertificate;
let awsThingCaChain;
let awsThing;
let storedAwsThing;
let secondStoredAwsThing;

// PLC
let plc;
let storedPlc;
let secondStoredPlc;

// Synchronisation
let synchronisationSchema;
let editSynchronisationSchema;

describe("AWS Things Controller - integration test", () => {
  beforeEach(async () => {
    server = require("../../../app");

    // AWS Thing
    awsThingCertificate = `
-----BEGIN CERTIFICATE-----
CERTIFICATE CONTENT
-----END CERTIFICATE-----
`;

    awsThingCaChain = `
-----BEGIN CERTIFICATE-----
CA CHAIN CONTENT
-----END CERTIFICATE-----
`;

    awsThingPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
Private KEY content
-----END RSA PRIVATE KEY-----
`;

    awsThing = {
      thingName: "750-831",
      host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
      certificate: awsThingCertificate,
      caChain: awsThingCaChain,
      privateKey: awsThingPrivateKey
    };
    storedAwsThing = await awsThingsController.createThing(awsThing);

    // PLC
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
    storedPlc = await wagoController.createWago(plc);

    synchronisationSchema = {
      plcId: storedPlc._id.toString(),
      cloudProvider: "aws",
      cloudOptionsId: storedAwsThing._id.toString(),
      interval: 5000
    };
  });

  afterEach(async () => {
    await server.close();
    await Synchronisation.deleteMany({});
    await AwsThing.deleteMany({});
    await Wago.deleteMany({});
  });

  describe("createSynchronisation", () => {
    beforeEach(async () => {
      await Synchronisation.deleteMany({});
    });

    it("should return a synchronisation object including id", async () => {
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then(result => {
          expect(result).toHaveProperty("_id");
          expect(result.cloudProvider).toBe(
            synchronisationSchema.cloudProvider
          );
          expect(result.interval).toBe(synchronisationSchema.interval);
          expect(result.plcId.toString()).toBe(storedPlc._id.toString());
          expect(result.cloudOptionsId.toString()).toBe(
            storedAwsThing._id.toString()
          );
        });
    });

    // PLC errors
    it("should return an error if no PLC id is provided", async () => {
      delete synchronisationSchema.plcId;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/"plcId" is required/i);
        });
    });

    it("should return an error PLC id is already used by another synchronisation", async () => {
      await synchronisationController.createSynchronisation(
        synchronisationSchema
      );
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .catch(err => {
          expect(err.message).toMatch(
            /PLC ID.* is already used in another synchronisation/i
          );
        });
    });

    it("should return an error if plc is not an ObjectId", async () => {
      synchronisationSchema.plcId = 123;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId" must be a string/i
          );
        });
    });

    it("should return an error if PLC ID is not a valid ObjectId", async () => {
      synchronisationSchema.plcId = "123";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId".*fails to match the valid mongo id pattern/i
          );
        });
    });

    it("should return an error if PLC ID is empty", async () => {
      synchronisationSchema.plcId = "";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if plcId is a valid Object ID but not associated with an existing PLC ", async () => {
      synchronisationSchema.plcId = "5dd6b9f33d27f3fd0306AAAA";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .catch(err => {
          expect(err.message).toMatch(
            /No PLC found with ID 5dd6b9f33d27f3fd0306AAAA/i
          );
        });
    });

    // cloudOptionsId errors
    it("should return an error if no cloudOptionsId is provided", async () => {
      delete synchronisationSchema.cloudOptionsId;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" is required/i
          );
        });
    });

    it("should return an error PLC id is already used by another synchronisation", async () => {
      const firstSyn = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      plc.ip = "100.100.100.100";
      const anotherStoredPlc = await wagoController.createWago(plc);

      await synchronisationController
        .createSynchronisation({
          plcId: anotherStoredPlc._id.toString(),
          cloudProvider: "aws",
          cloudOptionsId: storedAwsThing._id.toString(),
          interval: 5000
        })
        .catch(err => {
          expect(err.message).toMatch(
            /Cloud options ID.*is already used in another synchronisation/i
          );
        });
    });

    it("should return an error if cloudOptionsId is not an ObjectId", async () => {
      synchronisationSchema.cloudOptionsId = 123;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" must be a string/i
          );
        });
    });

    it("should return an error if cloudOptionsId is not a valid ObjectId", async () => {
      synchronisationSchema.cloudOptionsId = "123";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId".*fails to match the valid mongo id pattern/i
          );
        });
    });

    it("should return an error if cloudOptionsId is empty", async () => {
      synchronisationSchema.cloudOptionsId = "";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if cloudOptionsId is a valid Object ID but not associated with an existing aws Thing ", async () => {
      synchronisationSchema.cloudOptionsId = "5dd6b9f33d27f3fd0306AAAA";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .catch(err => {
          expect(err.message).toMatch(
            /No cloud options found with ID 5dd6b9f33d27f3fd0306AAAA/i
          );
        });
    });

    // cloudProvider errors
    it("should return an error if no cloudProvider is provided", async () => {
      delete synchronisationSchema.cloudProvider;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" is required/i
          );
        });
    });

    it("should return an error if cloudProvider is not an ObjectId", async () => {
      synchronisationSchema.cloudProvider = 123;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" must be a string/i
          );
        });
    });

    it("should return an error if cloudProvider is empty", async () => {
      synchronisationSchema.cloudProvider = "";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if cloudProvider less than 3 chars", async () => {
      synchronisationSchema.cloudProvider = "a";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" length must be at least 3 characters long/i
          );
        });
    });

    it("should return an error if cloudProvider more than 20 chars", async () => {
      synchronisationSchema.cloudProvider = "123456789012345678901";
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" length must be less than or equal to 20 characters long/i
          );
        });
    });

    // interval errors
    it("should return an error if no interval is provided", async () => {
      delete synchronisationSchema.interval;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" is required/i
          );
        });
    });

    it("should return an error if interval is not an number", async () => {
      synchronisationSchema.interval = true;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" must be a number/i
          );
        });
    });

    it("should return an error if interval less than 1000", async () => {
      synchronisationSchema.interval = 999;
      await synchronisationController
        .createSynchronisation(synchronisationSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" must be larger than or equal to 1000/i
          );
        });
    });
  });

  describe("getSynchronisations", () => {
    it("should return a synchronisation  by id if id is passed", async () => {
      const storedSynchronisation = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController
        .getSynchronisations(storedSynchronisation._id.toString())
        .then(result => {
          expect(result._id.toString()).toBe(
            storedSynchronisation._id.toString()
          );
        });
    });

    it("should return a synchronisation if no id is passed", async () => {
      await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController.getSynchronisations().then(result => {
        expect(result.length).toBe(1);
        expect(result[0]).toHaveProperty("_id");
      });
    });

    it("should return an invalid error if id is invalid", async () => {
      await synchronisationController
        .getSynchronisations("123")

        .catch(err => {
          expect(err.message).toMatch(/Invalid ID/i);
        });
    });

    it("should return an invalid id error if id is ", async () => {
      await synchronisationController
        .getSynchronisations("5dd9956eeb5dfd2f93c23ba6")
        .catch(err => {
          expect(err.message).toMatch(
            /No Synchronisation found with ID: 5dd9956eeb5dfd2f93c23ba6/i
          );
        });
    });
  });

  describe("editSynchronisation", () => {
    beforeEach(async () => {
      server = require("../../../app");

      awsThing = {
        thingName: "editSynchronisation",
        host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
        certificate: awsThingCertificate,
        caChain: awsThingCaChain,
        privateKey: awsThingPrivateKey
      };
      secondStoredAwsThing = await awsThingsController.createThing(awsThing);

      // PLC
      plc = {
        name: "Edit PLC",
        ip: "200.200.200.200",
        mac: "00:30:de:0a:de:dd",
        articleNumber: "750-330",
        modules: [466],
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
      secondStoredPlc = await wagoController.createWago(plc);

      editSynchronisationSchema = {
        plcId: secondStoredPlc._id.toString(),
        cloudProvider: "aws",
        cloudOptionsId: secondStoredAwsThing._id.toString(),
        interval: 5000
      };

      await Synchronisation.deleteMany({});
    });

    it("should an the edit sync", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );
      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .then(result => {
          expect(result.plcId.toString()).toBe(editSynchronisationSchema.plcId);
          expect(result.cloudOptionsId.toString()).toBe(
            editSynchronisationSchema.cloudOptionsId
          );
        });
    });

    // ID Errors
    it("should an invalid id error if invalid id is given", async () => {
      await synchronisationController
        .editSynchronisation("123", editSynchronisationSchema)
        .catch(err => {
          expect(err.message).toMatch(/Invalid ID/i);
        });
    });

    it("should an invalid id error if given id is not accosiated with a sync", async () => {
      await synchronisationController
        .editSynchronisation(
          "5dd9956eeb5dfd2f93c2AAAA",
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.message).toMatch(
            /No Synchronisation found with ID: 5dd9956eeb5dfd2f93c2AAAA/i
          );
        });
    });

    // PLC errors
    it("should return an error if no PLC id is provided", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      delete editSynchronisationSchema.plcId;
      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/"plcId" is required/i);
        });
    });

    it("should return an error PLC id is already used by another synchronisation", async () => {
      await synchronisationController.createSynchronisation(
        synchronisationSchema
      );
      const secondStoredSync = await synchronisationController.createSynchronisation(
        editSynchronisationSchema
      );

      editSynchronisationSchema.plcId = synchronisationSchema.plcId;

      await synchronisationController
        .editSynchronisation(
          secondStoredSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.message).toMatch(
            /PLC ID.* is already used in another synchronisation/i
          );
        });
    });

    it("should return an error if plc is not an ObjectId", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.plcId = 123;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId" must be a string/i
          );
        });
    });

    it("should return an error if PLC ID is not a valid ObjectId", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.plcId = "123";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId".*fails to match the valid mongo id pattern/i
          );
        });
    });

    it("should return an error if PLC ID is empty", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.plcId = "";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"plcId" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if plcId is a valid Object ID but not associated with an existing PLC ", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.plcId = "5dd6b9f33d27f3fd0306AAAA";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.message).toMatch(
            /No PLC found with ID 5dd6b9f33d27f3fd0306AAAA/i
          );
        });
    });

    // cloudOptionsId errors
    it("should return an error if no cloudOptionsId is provided", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      delete editSynchronisationSchema.cloudOptionsId;
      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" is required/i
          );
        });
    });

    it("should return an error PLC id is already used by another synchronisation", async () => {
      await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      plc.ip = "100.100.100.100";
      const anotherStoredPlc = await wagoController.createWago(plc);

      const secondStoredSync = await synchronisationController.createSynchronisation(
        editSynchronisationSchema
      );

      editSynchronisationSchema.plcId = anotherStoredPlc._id.toString();

      await synchronisationController
        .editSynchronisation(
          secondStoredSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.message).toMatch(
            /Cloud options ID.*is already used in another synchronisation/i
          );
        });
    });

    it("should return an error if cloudOptionsId is not an ObjectId", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudOptionsId = 123;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" must be a string/i
          );
        });
    });

    it("should return an error if cloudOptionsId is not a valid ObjectId", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudOptionsId = "123";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId".*fails to match the valid mongo id pattern/i
          );
        });
    });

    it("should return an error if cloudOptionsId is empty", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudOptionsId = "";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudOptionsId" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if cloudOptionsId is a valid Object ID but not associated with an existing aws Thing ", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudOptionsId = "5dd6b9f33d27f3fd0306AAAA";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.message).toMatch(
            /No AWS Thing found with ID 5dd6b9f33d27f3fd0306AAAA/i
          );
        });
    });

    // cloudProvider errors
    it("should return an error if no cloudProvider is provided", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      delete editSynchronisationSchema.cloudProvider;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" is required/i
          );
        });
    });

    it("should return an error if cloudProvider is not an ObjectId", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudProvider = 123;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" must be a string/i
          );
        });
    });

    it("should return an error if cloudProvider is empty", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudProvider = "";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" is not allowed to be empty/i
          );
        });
    });

    it("should return an error if cloudProvider less than 3 chars", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudProvider = "a";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" length must be at least 3 characters long/i
          );
        });
    });

    it("should return an error if cloudProvider more than 20 chars", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.cloudProvider = "123456789012345678901";

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"cloudProvider" length must be less than or equal to 20 characters long/i
          );
        });
    });

    // interval errors
    it("should return an error if no interval is provided", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      delete editSynchronisationSchema.interval;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" is required/i
          );
        });
    });

    it("should return an error if interval is not an number", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.interval = true;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" must be a number/i
          );
        });
    });

    it("should return an error if interval less than 1000", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      editSynchronisationSchema.interval = 999;

      await synchronisationController
        .editSynchronisation(
          storedSync._id.toString(),
          editSynchronisationSchema
        )
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /"interval" must be larger than or equal to 1000/i
          );
        });
    });
  });

  describe("deleteSynchronisation", () => {
    beforeEach(async () => {
      await Synchronisation.deleteMany({});
    });

    it("should an return a successfully deleted message", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController
        .deleteSynchronisation(storedSync._id.toString())
        .then(result =>
          expect(result).toMatch(
            /Successfully deleted Synchronisation with ID:.*/i
          )
        );
    });

    it("should an invalid id error if no id is given", async () => {
      await synchronisationController.deleteSynchronisation().catch(err => {
        expect(err.message).toMatch(/Invalid ID/i);
      });
    });

    it("should an invalid id error if invalid id is given", async () => {
      await synchronisationController
        .deleteSynchronisation("123")
        .catch(err => {
          expect(err.message).toMatch(/Invalid ID/i);
        });
    });

    it("should an invalid id error if given id is not accosiated with a sync", async () => {
      await synchronisationController
        .deleteSynchronisation("5dd9956eeb5dfd2f93c2AAAA")
        .catch(err => {
          expect(err.message).toMatch(
            /No Synchronisation found with ID: 5dd9956eeb5dfd2f93c2AAAA/i
          );
        });
    });
  });

  describe("updateSynchronisationStatus", () => {
    beforeEach(async () => {
      await Synchronisation.deleteMany({});
    });

    describe("id errors", () => {
      it("should an invalid id error if invalid id is given", async () => {
        const storedSync = await synchronisationController.createSynchronisation(
          synchronisationSchema
        );

        await synchronisationController
          .updateSynchronisationStatus(storedSync._id.toString(), true)
          .catch(err => {
            expect(err.message).toMatch(/Invalid ID/i);
          });
      });

      it("should an invalid id error if given id is not accosiated with a sync", async () => {
        await synchronisationController
          .updateSynchronisationStatus("5dd9956eeb5dfd2f93c2AAAA", true)
          .catch(err => {
            expect(err.message).toMatch(
              /No Synchronisation found with ID: 5dd9956eeb5dfd2f93c2AAAA/i
            );
          });
      });
    });

    it("should return invalid status value if no status is provided", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController
        .updateSynchronisationStatus(storedSync._id.toString())
        .catch(err => {
          expect(err.message).toMatch(/Invalid status value/i);
        });
    });

    it("should return invalid status value if provided status is not boolean", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController
        .updateSynchronisationStatus(storedSync._id.toString(), "a")
        .catch(err => {
          expect(err.message).toMatch(/Invalid status value/i);
        });
    });

    it("should return the synchronisation including the updated status", async () => {
      const storedSync = await synchronisationController.createSynchronisation(
        synchronisationSchema
      );

      await synchronisationController
        .updateSynchronisationStatus(storedSync._id.toString(), true)
        .then(result => {
          expect(result._id.toString()).toBe(storedSync._id.toString());
          expect(result).toHaveProperty("status");
          expect(result.status).toBe(true);
        });
    });
  });
});
