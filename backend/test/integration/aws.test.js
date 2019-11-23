const request = require("supertest");
const { AwsCert } = require("../../models/awsCerts");
const { User } = require("../../models/users");
const awsController = require("../../controller/awsCert");

let certSchema;
let userToken;
let storedCert;

describe("Users", () => {
  beforeEach(async () => {
    server = require("../../app");
    certSchema = {
      thingName: "750-831",
      certificate: `
    -----BEGIN CERTIFICATE-----
    CERTIFICATE CONTENT
    -----END CERTIFICATE-----
    `,
      caChain: `
    -----BEGIN CERTIFICATE-----
    CA CHAIN CONTENT
    -----END CERTIFICATE-----
    `,
      privateKey: `
    -----BEGIN RSA PRIVATE KEY-----
    Private KEY content
    -----END RSA PRIVATE KEY-----
    `
    };
    userToken = new User({ isAdmin: false }).generateToken();
  });

  afterEach(async () => {
    await server.close();
    await AwsCert.deleteMany({});
  });

  const executeGetCert = () => {
    return request(server)
      .get("/api/aws/certs")
      .set("x-auth-token", userToken)
      .send();
  };

  const executeGetIdCert = () => {
    return request(server)
      .get("/api/aws/certs/" + storedCert._id.toString())
      .set("x-auth-token", userToken)
      .send();
  };

  const executePostCert = () => {
    return request(server)
      .post("/api/aws/certs")
      .set("x-auth-token", userToken)
      .send(certSchema);
  };

  describe("GET /certs", () => {
    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .get("/api/aws/certs")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an empty token is provided", async () => {
      userToken = "";
      const result = await executeGetCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an invalid token", async () => {
      userToken = "a";
      const result = await executeGetCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 401 if old token is provided", async () => {
      userToken = "5dd65bccd4387dc776cdAAAA";
      const result = await executeGetCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 200 and an empty array if no cert is stored in the database", async () => {
      const result = await executeGetCert();

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(0);
    });

    it("should return an 200 with the given cert object including the _id property", async () => {
      await awsController.createCerts(certSchema);
      certSchema.thingName = "750-880";
      await awsController.createCerts(certSchema);

      const result = await executeGetCert();

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(2);
      expect(result.body[0]).toHaveProperty("_id");
      expect(result.body[1]).toHaveProperty("_id");
      expect(result.body[0]).not.toHaveProperty("privateKey");
      expect(result.body[0]).not.toHaveProperty("privateKey");
    });
  });

  describe("GET /certs/:id", () => {
    beforeEach(async () => {
      storedCert = await awsController.createCerts(certSchema);
    });

    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .get("/api/aws/certs/" + storedCert._id.toString())
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an empty token is provided", async () => {
      userToken = "";
      const result = await executeGetIdCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an invalid token", async () => {
      userToken = "a";
      const result = await executeGetIdCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 401 if old token is provided", async () => {
      userToken = "5dd65bccd4387dc776cdAAAA";
      const result = await executeGetIdCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 400 if id is invalid", async () => {
      const result = await request(server)
        .get("/api/aws/certs/" + "123")
        .set("x-auth-token", userToken)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid ID/i);
    });

    it("should return an 400 if no cert is accosiated with given id", async () => {
      const result = await request(server)
        .get("/api/aws/certs/" + "5dd95320c8ebe07401710AAA")
        .set("x-auth-token", userToken)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(
        /No AWS Certs found with given ID: 5dd95320c8ebe07401710AAA/i
      );
    });

    it("should return an 200 with the given cert object including the _id property", async () => {
      const result = await executeGetIdCert();

      expect(result.status).toBe(200);

      expect(result.body).toHaveProperty("_id");
      expect(result.body._id).toMatch(storedCert._id.toString());
      expect(result.body).not.toHaveProperty("privateKey");
    });
  });

  describe("POST /certs", () => {
    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .post("/api/aws/certs")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an empty token is provided", async () => {
      userToken = "";
      const result = await executePostCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/access denied/i);
    });

    it("should return an 401 if an invalid token", async () => {
      userToken = "a";
      const result = await executePostCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 401 if old token is provided", async () => {
      userToken = "5dd65bccd4387dc776cdAAAA";
      const result = await executePostCert();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return 400 if thingName is missing ", async () => {
      delete certSchema.thingName;
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is required/i);
    });

    it("should return 400 if thingName not a string", async () => {
      certSchema.thingName = 123;
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be a string/i);
    });

    it("should return 400 if thingName empty", async () => {
      certSchema.thingName = "";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is not allowed to be empty/i);
    });

    it("should return 400 if thingName less than 3 chars", async () => {
      certSchema.thingName = "a";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/at least 3 characters/i);
    });

    it("should return 400 if thingName longer than 255 chars", async () => {
      certSchema.thingName =
        "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(
        /less than or equal to 255 characters/i
      );
    });

    // CERTIFICATE
    it("should return 400 if certificate is not provided ", async () => {
      delete certSchema.certificate;
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is required/i);
    });

    it("should return 400 if certificate is empty ", async () => {
      certSchema.certificate = "";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is not allowed to be empty/i);
    });

    it("should return 400 if certificate is invalid ", async () => {
      certSchema.certificate = "aaa";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return 400 if certificate does not contain BEGIN CERTIFICATE", async () => {
      certSchema.certificate = "a -----END CERTIFICATE-----";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return 400 if certificate does not contain END CERTIFICATE", async () => {
      certSchema.certificate = "-----BEGIN CERTIFICATE----- a";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    // CA CHAIN
    it("should return 400 if caChain is not provided ", async () => {
      delete certSchema.caChain;
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is required/i);
    });

    it("should return 400 if caChain is empty ", async () => {
      certSchema.caChain = "";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is not allowed to be empty/i);
    });

    it("should return 400 if caChain is invalid ", async () => {
      certSchema.caChain = "aaa";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return400  if caChain does not contain BEGIN CERTIFICATE", async () => {
      certSchema.caChain = "a -----END CERTIFICATE-----";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return400  if caChain does not contain END CERTIFICATE", async () => {
      certSchema.caChain = "-----BEGIN CERTIFICATE----- a";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    // CA CHAIN
    it("should return 400 if privateKey is not provided ", async () => {
      delete certSchema.privateKey;
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is required/i);
    });

    it("should return 400 if privateKey is empty ", async () => {
      certSchema.privateKey = "";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/is not allowed to be empty/i);
    });

    it("should return 400 if privateKey is invalid ", async () => {
      certSchema.privateKey = "aaa";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return400  if privateKey does not contain BEGIN CERTIFICATE", async () => {
      certSchema.privateKey = "a -----END RSA PRIVATE KEY-----";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return400  if privateKey does not contain END CERTIFICATE", async () => {
      certSchema.privateKey = "-----BEGIN RSA PRIVATE KEY----- a";
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/invalid/i);
    });

    it("should return 400 when thingname is already registered", async () => {
      await executePostCert();
      const result = await executePostCert();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/already registered/i);
    });

    it("should return 200 and the result should contain _id property", async () => {
      const result = await executePostCert();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("_id");
    });
  });
});
