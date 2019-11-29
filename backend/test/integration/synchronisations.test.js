const request = require("supertest");
const { Synchronisation } = require("../../models/synchronisations");
const { AwsThing } = require("../../models/awsThings");
const { Wago } = require("../../models/wago");
const { User } = require("../../models/users");
const synchronisationsController = require("../../controller/synchronisations");
const awsThingsController = require("../../controller/awsThings");
const wagoController = require("../../controller/wago");

let getId;
let storedPlc;
let storedAwsThing;
let anotherStoredAwsThing;
let storedSync;
let anotherStoredSync;
let synchronisationSchema;
let syncStatus = { status: true };
let syncStatusId;

describe("Synchronisation Routes", () => {
  beforeEach(async () => {
    server = require("../../app");
    userToken = new User({ isAdmin: false }).generateToken();

    storedPlc = await wagoController.createWago({
      name: "750-831",
      ip: "192.168.1.4",
      mac: "00:30:de:0a:de:1d",
      articleNumber: "750-831",
      modules: [466, 496],
      files: [
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
    });
    storedAwsThing = await awsThingsController.createThing({
      thingName: "750-831",
      host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
      certificate: `
      -----BEGIN CERTIFICATE-----
      certificate CONTENT
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
    });

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
    await Wago.deleteMany({});
    await AwsThing.deleteMany({});
  });

  const executeGet = id => {
    if (!id) {
      return request(server)
        .get("/api/synchronisations/")
        .set("x-auth-token", userToken)
        .send();
    } else {
      return request(server)
        .get("/api/synchronisations/" + id)
        .set("x-auth-token", userToken)
        .send();
    }
  };

  const executePost = schema => {
    return request(server)
      .post("/api/synchronisations/")
      .set("x-auth-token", userToken)
      .send(schema);
  };

  const executePut = (id, schema) => {
    if (!id) {
      return request(server)
        .put("/api/synchronisations/")
        .set("x-auth-token", userToken)
        .send(schema);
    } else {
      return request(server)
        .put("/api/synchronisations/" + id)
        .set("x-auth-token", userToken)
        .send(schema);
    }
  };

  const executeDelete = id => {
    if (!id) {
      return request(server)
        .delete("/api/synchronisations/")
        .set("x-auth-token", userToken)
        .send();
    } else {
      return request(server)
        .delete("/api/synchronisations/" + id)
        .set("x-auth-token", userToken)
        .send();
    }
  };

  const executeStatus = id => {
    return request(server)
      .post("/api/synchronisations/" + id + "/status")
      .set("x-auth-token", userToken)
      .send(syncStatus);
  };

  describe("GET /", () => {
    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .get("/api/synchronisations/")
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    it("should return an 200 and an empty array if no thing is stored in the database", async () => {
      const result = await executeGet();

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(0);
    });

    it("should return an 1 stored synchronisation", async () => {
      storedSynchronisation = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );
      const result = await executeGet();

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(1);
      expect(result.body[0]._id.toString()).toBe(
        storedSynchronisation._id.toString()
      );
    });
  });

  describe("GET /:id", () => {
    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .get("/api/synchronisations/")
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeGet();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    it("should return an 400 if sync id is not found", async () => {
      const result = await executeGet("5dd65bccd4387dc776cdAAAA");

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/No Synchronisation found with ID.*/i);
    });

    it("should return an 400 if sync id is invalid", async () => {
      const result = await executeGet("123");

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid ID/i);
    });

    it("should return 200 and the stored object by id", async () => {
      const storedSynchronisation = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );
      const result = await executeGet(storedSynchronisation._id.toString());

      expect(result.status).toBe(200);
      expect(result.body._id.toString()).toBe(
        storedSynchronisation._id.toString()
      );
    });
  });

  describe("POST /:id", () => {
    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .post("/api/synchronisations/")
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executePost();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executePost();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executePost();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    describe("plcID errors", () => {
      it("should return an 400 if no plcId is provided in the schema", async () => {
        delete synchronisationSchema.plcId;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*plcId.*is required/i);
      });

      it("should return an 400 if an empty plcId is provided in the schema", async () => {
        synchronisationSchema.plcId = "";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*plcId.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given plcId is not a string", async () => {
        synchronisationSchema.plcId = 123;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*plcId.*must be a string/i);
      });

      it("should return an 400 if  the given plcId is not a valid ObjectId", async () => {
        synchronisationSchema.plcId = "123";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*plcId.*fails to match the valid mongo id pattern/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not used in the db", async () => {
        synchronisationSchema.plcId = "5ddeb2a2a3aeb72ca18eAAAA";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No PLC found with ID.*/i);
      });

      it("should return an 400 if  the given plcId is already used by another synchronisation", async () => {
        await synchronisationsController.createSynchronisation(
          synchronisationSchema
        );
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /PLC ID.*is already used in another synchronisation/i
        );
      });
    });

    describe("cloudProvider errors", () => {
      it("should return an 400 if no cloudProvider is provided in the schema", async () => {
        delete synchronisationSchema.cloudProvider;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*cloudProvider.*is required/i);
      });

      it("should return an 400 if an empty cloudProvider is provided in the schema", async () => {
        synchronisationSchema.cloudProvider = "";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudProvider.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given cloudProvider is not a string", async () => {
        synchronisationSchema.cloudProvider = 123;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*cloudProvider.*must be a string/i);
      });
    });

    describe("cloudOptionsId errors", () => {
      it("should return an 400 if no cloudOptionsId is provided in the schema", async () => {
        delete synchronisationSchema.cloudOptionsId;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*cloudOptionsId.*is required/i);
      });

      it("should return an 400 if an empty cloudOptionsId is provided in the schema", async () => {
        synchronisationSchema.cloudOptionsId = "";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not a string", async () => {
        synchronisationSchema.cloudOptionsId = 123;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*must be a string/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not a valid ObjectId", async () => {
        synchronisationSchema.cloudOptionsId = "123";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*fails to match the valid mongo id pattern/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not used in the db", async () => {
        synchronisationSchema.cloudOptionsId = "5ddeb2a2a3aeb72ca18eAAAA";
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No cloud options found with ID.*/i);
      });

      it("should return an 400 if  the given cloudOptionsId is already used by another synchronisation", async () => {
        await synchronisationsController.createSynchronisation(
          synchronisationSchema
        );

        // create another valid plc in database
        const anotherPlc = await wagoController.createWago({
          name: "750-880",
          ip: "192.168.1.10",
          mac: "00:30:de:0a:de:1d",
          articleNumber: "750-831",
          modules: [466, 496],
          files: []
        });
        synchronisationSchema.plcId = anotherPlc._id.toString();

        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /Cloud options ID.*is already used in another synchronisation/i
        );
      });
    });

    describe("intervall errors", () => {
      it("should return an 400 if no interval is provided in the schema", async () => {
        delete synchronisationSchema.interval;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*interval.*is required/i);
      });

      it("should return an 400 if  the given interval is not a number", async () => {
        synchronisationSchema.interval = true;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*interval.*must be a number/i);
      });

      it("should return an 400 if  number is lower than 1000", async () => {
        synchronisationSchema.interval = 999;
        const result = await executePost(synchronisationSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*interval.*must be larger than or equal to 1000/i
        );
      });
    });

    it("should return 200 if the sync was successfully created", async () => {
      const result = await executePost(synchronisationSchema);

      expect(result.status).toBe(200);
      expect(result.body.plcId.toString()).toBe(
        synchronisationSchema.plcId.toString()
      );
      expect(result.body.cloudOptionsId.toString()).toBe(
        synchronisationSchema.cloudOptionsId.toString()
      );
      expect(result.body.cloudProvider).toBe(
        synchronisationSchema.cloudProvider
      );
      expect(result.body.interval).toBe(synchronisationSchema.interval);
    });
  });

  describe("EDIT /:id", () => {
    beforeEach(async () => {
      storedSync = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );

      // create another valid plc in database
      anotherStoredPlc = await wagoController.createWago({
        name: "750-880",
        ip: "192.168.1.10",
        mac: "00:30:de:0a:de:1d",
        articleNumber: "750-831",
        modules: [466, 496],
        files: []
      });

      anotherStoredAwsThing = await awsThingsController.createThing({
        thingName: "750-880",
        host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
        certificate: `
        -----BEGIN CERTIFICATE-----
        certificate CONTENT
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
      });

      synchronisationSchema = {
        plcId: anotherStoredPlc._id.toString(),
        cloudProvider: "aws",
        cloudOptionsId: anotherStoredAwsThing._id.toString(),
        interval: 3000
      };

      anotherStoredSync = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );
    });
    afterEach(async () => {
      await Synchronisation.deleteMany({});
    });

    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .put("/api/synchronisations/" + storedSync._id.toString())
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executePost(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executePost(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executePost(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    describe("id errors", () => {
      it("should return an 400 if sync id is not found", async () => {
        const result = await executePut("5dd65bccd4387dc776cdAAAA");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /No Synchronisation found with ID.*/i
        );
      });

      it("should return an 400 if sync id is not valid", async () => {
        const result = await executePut("123");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });
    });

    describe("plcID errors", () => {
      it("should return an 400 if no plcId is provided in the schema", async () => {
        delete synchronisationSchema.plcId;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*plcId.*is required/i);
      });

      it("should return an 400 if an empty plcId is provided in the schema", async () => {
        synchronisationSchema.plcId = "";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*plcId.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given plcId is not a string", async () => {
        synchronisationSchema.plcId = 123;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*plcId.*must be a string/i);
      });

      it("should return an 400 if  the given plcId is not a valid ObjectId", async () => {
        synchronisationSchema.plcId = "123";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*plcId.*fails to match the valid mongo id pattern/i
        );
      });

      it("should return an 400 if  the given plcId is not used in the db", async () => {
        synchronisationSchema.plcId = "5ddeb2a2a3aeb72ca18eAAAA";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No PLC found with ID.*/i);
      });

      it("should return an 400 if  the given plcId is already used by another synchronisation", async () => {
        synchronisationSchema.plcId = anotherStoredSync.plcId.toString();
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /PLC ID.*is already used in another synchronisation/i
        );
      });
    });

    describe("cloudProvider errors", () => {
      it("should return an 400 if no cloudProvider is provided in the schema", async () => {
        delete synchronisationSchema.cloudProvider;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*cloudProvider.*is required/i);
      });

      it("should return an 400 if an empty cloudProvider is provided in the schema", async () => {
        synchronisationSchema.cloudProvider = "";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudProvider.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given cloudProvider is not a string", async () => {
        synchronisationSchema.cloudProvider = 123;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*cloudProvider.*must be a string/i);
      });
    });

    describe("cloudOptionsId errors", () => {
      it("should return an 400 if no cloudOptionsId is provided in the schema", async () => {
        delete synchronisationSchema.cloudOptionsId;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*plcId.*is required/i);
      });

      it("should return an 400 if an empty cloudOptionsId is provided in the schema", async () => {
        synchronisationSchema.cloudOptionsId = "";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*is not allowed to be empty/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not a string", async () => {
        synchronisationSchema.cloudOptionsId = 123;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*must be a string/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not a valid ObjectId", async () => {
        synchronisationSchema.cloudOptionsId = "123";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*cloudOptionsId.*fails to match the valid mongo id pattern/i
        );
      });

      it("should return an 400 if  the given cloudOptionsId is not used in the db", async () => {
        synchronisationSchema.plcId = storedPlc._id.toString();
        synchronisationSchema.cloudOptionsId = "5ddeb2a2a3aeb72ca18eAAAA";
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No AWS Thing found with ID.*/i);
      });

      it("should return an 400 if  the given cloudOptionsId is already used by another synchronisation", async () => {
        synchronisationSchema.plcId = storedPlc._id.toString();
        synchronisationSchema.cloudOptionsId = anotherStoredSync.cloudOptionsId.toString();
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /Cloud options ID.*is already used in another synchronisation/i
        );
      });
    });

    describe("intervall errors", () => {
      it("should return an 400 if no interval is provided in the schema", async () => {
        delete synchronisationSchema.interval;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*interval.*is required/i);
      });

      it("should return an 400 if  the given interval is not a number", async () => {
        synchronisationSchema.interval = true;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/.*interval.*must be a number/i);
      });

      it("should return an 400 if  number is lower than 1000", async () => {
        synchronisationSchema.interval = 999;
        const result = await executePut(
          storedSync._id.toString(),
          synchronisationSchema
        );

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /.*interval.*must be larger than or equal to 1000/i
        );
      });
    });

    describe("status", () => {
      it("should return 400 if synchronisation status is true/active", async () => {
        anotherStoredPlc = await wagoController.createWago({
          name: "750-880",
          ip: "192.168.1.100",
          mac: "00:30:de:0a:de:1d",
          articleNumber: "750-831",
          modules: [466, 496],
          files: []
        });

        anotherStoredAwsThing = await awsThingsController.createThing({
          thingName: "750-333",
          host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
          certificate: `
          -----BEGIN CERTIFICATE-----
          certificate CONTENT
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
        });

        const activeSchema = {
          plcId: anotherStoredPlc._id.toString(),
          cloudProvider: "aws",
          cloudOptionsId: anotherStoredAwsThing._id.toString(),
          interval: 5000,
          status: true
        };

        const storedActiveSynch = new Synchronisation(activeSchema);
        await storedActiveSynch.save();

        delete activeSchema.status;

        const result = await executePut(
          storedActiveSynch._id.toString(),
          activeSchema
        );

        expect(result.status).toBe(400);
        expect(result.res.text).toMatch(
          /Synchronisation status is active, please deactivate the synchronisation first/i
        );
      });
    });

    it("should return 200 if sync was successfully edit", async () => {
      anotherStoredPlc = await wagoController.createWago({
        name: "750-333",
        ip: "192.168.1.1",
        mac: "00:30:de:0a:de:1d",
        articleNumber: "750-831",
        modules: [466, 496],
        files: []
      });

      anotherStoredAwsThing = await awsThingsController.createThing({
        thingName: "750-333",
        host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
        certificate: `
        -----BEGIN CERTIFICATE-----
        certificate CONTENT
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
      });

      synchronisationSchema = {
        plcId: anotherStoredPlc._id.toString(),
        cloudProvider: "microsoft",
        cloudOptionsId: anotherStoredAwsThing._id.toString(),
        interval: 3333
      };
      const result = await executePut(
        storedSync._id.toString(),
        synchronisationSchema
      );

      expect(result.status).toBe(200);
      expect(result.body.plcId.toString()).toBe(
        synchronisationSchema.plcId.toString()
      );
      expect(result.body.cloudProvider).toBe(
        synchronisationSchema.cloudProvider
      );
      expect(result.body.cloudOptionsId.toString()).toBe(
        synchronisationSchema.cloudOptionsId.toString()
      );
      expect(result.body.interval).toBe(synchronisationSchema.interval);
    });
  });

  describe("DELETE /:ID", () => {
    beforeEach(async () => {
      storedSync = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );
    });

    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .delete("/api/synchronisations/" + storedSync._id.toString())
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeDelete(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeDelete(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeDelete(storedSync._id.toString());

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    describe("id errors", () => {
      it("should return an 400 if sync id is not found", async () => {
        const result = await executeDelete("5dd65bccd4387dc776cdAAAA");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /No Synchronisation found with ID.*/i
        );
      });

      it("should return an 400 if sync id is not valid", async () => {
        const result = await executeDelete("123");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });
    });

    it("should return 400 if synchronisation status is true/active", async () => {
      anotherStoredPlc = await wagoController.createWago({
        name: "750-880",
        ip: "192.168.1.10",
        mac: "00:30:de:0a:de:1d",
        articleNumber: "750-831",
        modules: [466, 496],
        files: []
      });

      anotherStoredAwsThing = await awsThingsController.createThing({
        thingName: "750-880",
        host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com",
        certificate: `
        -----BEGIN CERTIFICATE-----
        certificate CONTENT
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
      });

      const activeSchema = {
        plcId: anotherStoredPlc._id.toString(),
        cloudProvider: "aws",
        cloudOptionsId: anotherStoredAwsThing._id.toString(),
        interval: 5000,
        status: true
      };

      const storedActiveSynch = new Synchronisation(activeSchema);
      await storedActiveSynch.save();

      const result = await executeDelete(storedActiveSynch._id.toString());

      expect(result.status).toBe(400);
      expect(result.res.text).toMatch(
        /Synchronisation status is active, please deactivate the synchronisation first/i
      );
    });

    it("should return 200 and a successfully deleted message", async () => {
      const result = await executeDelete(storedSync._id.toString());

      expect(result.status).toBe(200);
      expect(result.res.text).toMatch(
        /.*Successfully deleted Synchronisation with ID.*/i
      );
    });
  });

  describe("POST /:ID/status", () => {
    beforeEach(async () => {
      storedSync = await synchronisationsController.createSynchronisation(
        synchronisationSchema
      );
      syncStatusId = storedSync._id.toString();
    });

    describe("auth", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .post("/api/synchronisations/" + syncStatusId + "/status")
          .send(syncStatus);

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeStatus(syncStatusId);

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeStatus(syncStatusId);

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeStatus(syncStatusId);

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });
    });

    describe("id errors", () => {
      it("should return an 400 if sync id is not found", async () => {
        const result = await executeStatus("5dd65bccd4387dc776cdAAAA");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /No Synchronisation found with ID.*/i
        );
      });

      it("should return an 400 if sync id is not valid", async () => {
        const result = await executeStatus("123");

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });
    });

    it("should return an 400 if no status is provided", async () => {
      const result = await request(server)
        .post("/api/synchronisations/" + syncStatusId + "/status")
        .set("x-auth-token", userToken)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid status value/i);
    });

    it("should return an 400 if an invalid status is provided", async () => {
      const result = await request(server)
        .post("/api/synchronisations/" + syncStatusId + "/status")
        .set("x-auth-token", userToken)
        .send({ status: "a" });

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid status value/i);
    });

    it("should return 200 and the sync with status true", async () => {
      const result = await executeStatus(syncStatusId);

      expect(result.status).toBe(200);
      expect(result.body.status).toBe(syncStatus.status);
    });
  });
});
