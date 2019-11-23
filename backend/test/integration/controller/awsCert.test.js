const { AwsCert } = require("../../../models/awsCerts");
const awsController = require("../../../controller/awsCert");

let server;
let testCa;
let testCert;
let testKey;
let certObject;

describe("Wago controller - integration test", () => {
  beforeEach(async () => {
    server = require("../../../app");
    testCert = `
-----BEGIN CERTIFICATE-----
CERTIFICATE CONTENT
-----END CERTIFICATE-----
`;

    testCa = `
-----BEGIN CERTIFICATE-----
CA CHAIN CONTENT
-----END CERTIFICATE-----
`;

    testKey = `
-----BEGIN RSA PRIVATE KEY-----
Private KEY content
-----END RSA PRIVATE KEY-----
`;

    certObject = {
      thingName: "750-831",
      certificate: testCert,
      caChain: testCa,
      privateKey: testKey
    };
  });

  afterEach(async () => {
    await server.close();
    await AwsCert.deleteMany({});
  });

  describe("createAwsCert", () => {
    it("should return the given cert with an db _id property", async () => {
      await awsController.createCerts(certObject).then(result => {
        expect(result).toHaveProperty("_id");
      });
    });

    it("should return an required error if thingName is missing", async () => {
      delete certObject.thingName;
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if thingName not a string", async () => {
      certObject.thingName = 123;
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/must be a string/i);
        });
    });

    it("should return an error if thingName empty", async () => {
      certObject.thingName = "";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if thingName less than 3 chars", async () => {
      certObject.thingName = "a";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /at least 3 characters/i
          );
        });
    });

    it("should return an error if thingName longer than 255 chars", async () => {
      certObject.thingName =
        "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /less than or equal to 255 characters/i
          );
        });
    });

    it("should return an error if certificate is not provided", async () => {
      delete certObject.certificate;

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if certificate is empty", async () => {
      certObject.certificate = "";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if certificate is invalid", async () => {
      certObject.certificate = "a";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain BEGINN CERTIFICATE", async () => {
      certObject.certificate = "a -----END CERTIFICATE-----";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if certificate does not contain END CERTIFICATE", async () => {
      certObject.certificate = "-----BEGIN CERTIFICATE----- a";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain is not provided", async () => {
      delete certObject.caChain;

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if caChain is empty", async () => {
      certObject.certificate = "";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if caChain is invalid", async () => {
      certObject.caChain = "a";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain BEGINN CERTIFICATE", async () => {
      certObject.caChain = "a -----END CERTIFICATE-----";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if caChain does not contain END CERTIFICATE", async () => {
      certObject.caChain = "-----BEGIN CERTIFICATE----- a";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    // Privatekey
    it("should return an error if privateKey is not provided", async () => {
      delete certObject.privateKey;

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(/is required/i);
        });
    });

    it("should return an error if privateKey is empty", async () => {
      certObject.privateKey = "";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error.details[0].message).toMatch(
            /is not allowed to be empty/i
          );
        });
    });

    it("should return an error if privateKey is invalid", async () => {
      certObject.privateKey = "a";

      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain BEGIN RSA PRIVATE KEY", async () => {
      certObject.privateKey = "a -----END RSA PRIVATE KEY-----";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });

    it("should return an error if privateKey does not contain END RSA PRIVATE KEY", async () => {
      certObject.privateKey = "-----BEGIN RSA PRIVATE KEY----- a";
      await awsController
        .createCerts(certObject)
        .then()
        .catch(err => {
          expect(err.error).toMatch(/invalid/i);
        });
    });
  });
});
