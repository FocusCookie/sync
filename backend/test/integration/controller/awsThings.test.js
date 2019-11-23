const { AwsThing } = require("../../../models/awsThings");
const awsThingsController = require("../../../controller/awsThings");

let server;
let testCsChain;
let testCertificate;
let testPrivateKey;
let thingSchema;
let storedThing;

describe("AWS Things Controller - integration test", () => {
  beforeEach(async () => {
    server = require("../../../app");
    testCertificate = `
-----BEGIN CERTIFICATE-----
CERTIFICATE CONTENT
-----END CERTIFICATE-----
`;

    testCsChain = `
-----BEGIN CERTIFICATE-----
CA CHAIN CONTENT
-----END CERTIFICATE-----
`;

    testPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
Private KEY content
-----END RSA PRIVATE KEY-----
`;

    thingSchema = {
      thingName: "750-831",
      certificate: testCertificate,
      caChain: testCsChain,
      privateKey: testPrivateKey
    };
  });

  afterEach(async () => {
    await server.close();
    await AwsThing.deleteMany({});
  });

  describe("createAwsThing", () => {
    it("should return the given thing with an db _id property", async () => {
      await awsThingsController.createThing(thingSchema).then(result => {
        expect(result).toHaveProperty("_id");
      });
    });

    it("should return an required error if thingName is missing", async () => {
      delete thingSchema.thingName;
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if thingName not a string", async () => {
      thingSchema.thingName = 123;
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/must be a string/i);
        });
    });

    it("should return an error if thingName empty", async () => {
      thingSchema.thingName = "";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if thingName less than 3 chars", async () => {
      thingSchema.thingName = "a";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /at least 3 characters/i
          );
        });
    });

    it("should return an error if thingName longer than 255 chars", async () => {
      thingSchema.thingName =
        "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /less than or equal to 255 characters/i
          );
        });
    });

    it("should return an error if certificate is not provided", async () => {
      delete thingSchema.certificate;

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if certificate is empty", async () => {
      thingSchema.certificate = "";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if certificate is invalid", async () => {
      thingSchema.certificate = "a";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain BEGINN CERTIFICATE", async () => {
      thingSchema.certificate = "a -----END CERTIFICATE-----";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain END CERTIFICATE", async () => {
      thingSchema.certificate = "-----BEGIN CERTIFICATE----- a";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain is not provided", async () => {
      delete thingSchema.caChain;

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if caChain is empty", async () => {
      thingSchema.certificate = "";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if caChain is invalid", async () => {
      thingSchema.caChain = "a";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain BEGINN CERTIFICATE", async () => {
      thingSchema.caChain = "a -----END CERTIFICATE-----";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain END CERTIFICATE", async () => {
      thingSchema.caChain = "-----BEGIN CERTIFICATE----- a";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    // Privatekey
    it("should return an error if privateKey is not provided", async () => {
      delete thingSchema.privateKey;

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if privateKey is empty", async () => {
      thingSchema.privateKey = "";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if privateKey is invalid", async () => {
      thingSchema.privateKey = "a";

      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain BEGIN RSA PRIVATE KEY", async () => {
      thingSchema.privateKey = "a -----END RSA PRIVATE KEY-----";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain END RSA PRIVATE KEY", async () => {
      thingSchema.privateKey = "-----BEGIN RSA PRIVATE KEY----- a";
      await awsThingsController
        .createThing(thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });
  });

  describe("editThing", () => {
    beforeEach(async () => {
      storedThing = await awsThingsController.createThing(thingSchema);
      testCertificate = `
-----BEGIN CERTIFICATE-----
EDIT CERTIFICATE CONTENT
-----END CERTIFICATE-----
`;

      testCsChain = `
-----BEGIN CERTIFICATE-----
EDIT CA CHAIN CONTENT
-----END CERTIFICATE-----
`;

      testPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
EDIT Private KEY content
-----END RSA PRIVATE KEY-----
`;
      thingSchema = {
        thingName: "EDIT 750-831",
        certificate: testCertificate,
        caChain: testCsChain,
        privateKey: testPrivateKey
      };
    });

    it("should return an required error if thingName is missing", async () => {
      delete thingSchema.thingName;
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if thingName not a string", async () => {
      thingSchema.thingName = 123;
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/must be a string/i);
        });
    });

    it("should return an error if thingName empty", async () => {
      thingSchema.thingName = "";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if thingName less than 3 chars", async () => {
      thingSchema.thingName = "a";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /at least 3 characters/i
          );
        });
    });

    it("should return an error if thingName longer than 255 chars", async () => {
      thingSchema.thingName =
        "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /less than or equal to 255 characters/i
          );
        });
    });

    it("should return an error if certificate is not provided", async () => {
      delete thingSchema.certificate;

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if certificate is empty", async () => {
      thingSchema.certificate = "";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if certificate is invalid", async () => {
      thingSchema.certificate = "a";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain BEGINN CERTIFICATE", async () => {
      thingSchema.certificate = "a -----END CERTIFICATE-----";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain END CERTIFICATE", async () => {
      thingSchema.certificate = "-----BEGIN CERTIFICATE----- a";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain is not provided", async () => {
      delete thingSchema.caChain;

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if caChain is empty", async () => {
      thingSchema.certificate = "";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if caChain is invalid", async () => {
      thingSchema.caChain = "a";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain BEGINN CERTIFICATE", async () => {
      thingSchema.caChain = "a -----END CERTIFICATE-----";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain END CERTIFICATE", async () => {
      thingSchema.caChain = "-----BEGIN CERTIFICATE----- a";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    // Privatekey
    it("should return an error if privateKey is not provided", async () => {
      delete thingSchema.privateKey;

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if privateKey is empty", async () => {
      thingSchema.privateKey = "";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if privateKey is invalid", async () => {
      thingSchema.privateKey = "a";

      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain BEGIN RSA PRIVATE KEY", async () => {
      thingSchema.privateKey = "a -----END RSA PRIVATE KEY-----";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain END RSA PRIVATE KEY", async () => {
      thingSchema.privateKey = "-----BEGIN RSA PRIVATE KEY----- a";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if thingsname is already registered", async () => {
      thingSchema.thingName = "750-831";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/already registered/i);
        });
    });

    it("should return the edit Thing with even if the name is the same", async () => {
      thingSchema.thingName = "750-831";
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then(result => {
          expect(result.thingName).toBe("750-831");
          expect(result.certificate).toBe(thingSchema.certificate);
          expect(result.caChain).toBe(thingSchema.caChain);
        });
    });

    it("should return the edit object with all properties edit (not check private key because of hash) ", async () => {
      await awsThingsController
        .editThing(storedThing._id.toString(), thingSchema)
        .then(result => {
          expect(result.thingName).toBe(thingSchema.thingName);
          expect(result.certificate).toBe(thingSchema.certificate);
          expect(result.caChain).toBe(thingSchema.caChain);
        });
    });

    it("should return the edit object with all properties edit (not check private key because of hash) ", async () => {
      await awsThingsController
        .editThing("5dd914f29eb31a5aacd1AAAA", thingSchema)
        .then()
        .catch(err => {
          expect(err.toString()).toMatch(
            /No Thing found with ID: 5dd914f29eb31a5aacd1AAAA/i
          );
        });
    });
  });
});
