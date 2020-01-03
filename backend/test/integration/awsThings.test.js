const request = require("supertest");
const { AwsThing } = require("../../models/awsThings");
const { User } = require("../../models/users");
const awsThingsController = require("../../controller/awsThings");
const fs = require("fs");
const path = require("path");

let thingSchema;
let userToken;
let storedThing;
const certsDirectory = path.join(__dirname, "../", "../", "certs/aws/");

function deleteCerts() {
  fs.readdir(certsDirectory, (err, files) => {
    if (err) {
      console.log(err);
    } else {
      if (files.length > 0) {
        files.forEach(file => {
          fs.unlinkSync(certsDirectory + file);
        });
      }
    }
  });
  return;
}

describe("AWS Routes", () => {
  beforeEach(async () => {
    server = require("../../app");
    thingSchema = {
      thingName: "750-831",
      host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com"
    };
    userToken = new User({ isAdmin: false }).generateToken();
  });

  afterEach(async () => {
    await server.close();
    await AwsThing.deleteMany({});
  });

  const executeGetThing = () => {
    return request(server)
      .get("/api/aws/things")
      .set("x-auth-token", userToken)
      .send();
  };

  const executeGetIdThing = () => {
    return request(server)
      .get("/api/aws/things/" + storedThing._id.toString())
      .set("x-auth-token", userToken)
      .send();
  };

  const executePostThing = () => {
    return request(server)
      .post("/api/aws/things")
      .set("x-auth-token", userToken)
      .send(thingSchema);
  };

  const executePutThing = () => {
    return request(server)
      .put("/api/aws/things/" + storedThing._id.toString())
      .set("x-auth-token", userToken)
      .send(thingSchema);
  };

  const executeDelete = () => {
    return request(server)
      .delete("/api/aws/things/" + storedThing._id.toString())
      .set("x-auth-token", userToken)
      .send();
  };

  const executePostThingCerts = id => {
    return request(server)
      .post("/api/aws/things/" + id + "/certs")
      .attach(
        "certs",
        path.join(
          __dirname,
          "../../../aws certs/750-831/d6c62e892c-certificate.pem.crt"
        )
      )
      .attach(
        "certs",
        path.join(
          __dirname,
          "../../../aws certs/750-831/d6c62e892c-private.pem.key"
        )
      )
      .attach(
        "certs",
        path.join(__dirname, "../../../aws certs/750-831/AmazonRootCA1.pem")
      )
      .set("x-auth-token", userToken);
  };

  const executeDeleteThingCerts = () => {
    return request(server)
      .delete("/api/aws/things/" + storedThing._id.toString() + "/certs")
      .set("x-auth-token", userToken)
      .send();
  };

  describe("things", () => {
    describe("GET /things", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .get("/api/aws/things")
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeGetThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeGetThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeGetThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 200 and an empty array if no thing is stored in the database", async () => {
        const result = await executeGetThing();

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(0);
      });

      it("should return an 200 with the given thing object including the _id property", async () => {
        await awsThingsController.createThing(thingSchema);
        thingSchema.thingName = "750-880";
        await awsThingsController.createThing(thingSchema);

        const result = await executeGetThing();

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(2);
        expect(result.body[0]).toHaveProperty("_id");
        expect(result.body[1]).toHaveProperty("_id");
      });
    });

    describe("GET /things/:id", () => {
      beforeEach(async () => {
        storedThing = await awsThingsController.createThing(thingSchema);
      });

      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .get("/api/aws/things/" + storedThing._id.toString())
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeGetIdThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executeGetIdThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executeGetIdThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 400 if id is invalid", async () => {
        const result = await request(server)
          .get("/api/aws/things/" + "123")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });

      it("should return an 400 if no thing is accosiated with given id", async () => {
        const result = await request(server)
          .get("/api/aws/things/" + "5dd95320c8ebe07401710AAA")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /No AWS Thing found with given ID: 5dd95320c8ebe07401710AAA/i
        );
      });

      it("should return an 200 with the given Thing object including the _id property", async () => {
        const result = await executeGetIdThing();

        expect(result.status).toBe(200);

        expect(result.body).toHaveProperty("_id");
        expect(result.body._id).toMatch(storedThing._id.toString());
      });
    });

    describe("POST /things", () => {
      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .post("/api/aws/things")
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executePostThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executePostThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executePostThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      // ThingName
      it("should return 400 when thingname is already registered", async () => {
        await executePostThing();
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/already registered/i);
      });

      it("should return 400 if thingName is missing ", async () => {
        delete thingSchema.thingName;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is required/i);
      });

      it("should return 400 if thingName not a string", async () => {
        thingSchema.thingName = 123;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/must be a string/i);
      });

      it("should return 400 if thingName empty", async () => {
        thingSchema.thingName = "";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is not allowed to be empty/i);
      });

      it("should return 400 if thingName less than 3 chars", async () => {
        thingSchema.thingName = "a";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/at least 3 characters/i);
      });

      it("should return 400 if thingName longer than 255 chars", async () => {
        thingSchema.thingName =
          "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /less than or equal to 255 characters/i
        );
      });

      // Host
      it("should return 400 if host is missing ", async () => {
        delete thingSchema.host;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is required/i);
      });

      it("should return 400 if host not a string", async () => {
        thingSchema.host = 123;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/must be a string/i);
      });

      it("should return 400 if host empty", async () => {
        thingSchema.host = "";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is not allowed to be empty/i);
      });

      it("should return 400 if host less than 10 chars", async () => {
        thingSchema.host = "a";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/at least 10 characters/i);
      });

      it("should return 400 if host longer than 255 chars", async () => {
        thingSchema.host =
          "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /less than or equal to 255 characters/i
        );
      });

      it("should return 200 and the result should contain _id property", async () => {
        const result = await executePostThing();

        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("_id");
      });
    });

    describe("PUT /things/:id", () => {
      beforeEach(async () => {
        thingSchema = {
          thingName: "EDIT 750-831",
          host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com"
        };

        storedThing = await awsThingsController.createThing(thingSchema);
      });

      it("should return an 401 if no token is provided", async () => {
        const result = await request(server)
          .put("/api/aws/things/:" + storedThing._id.toString())
          .send();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executePutThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/access denied/i);
      });

      it("should return an 401 if an invalid token", async () => {
        userToken = "a";
        const result = await executePutThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      it("should return an 401 if old token is provided", async () => {
        userToken = "5dd65bccd4387dc776cdAAAA";
        const result = await executePutThing();

        expect(result.status).toBe(401);
        expect(result.error.text).toMatch(/Invalid token/i);
      });

      // ThingName
      it("should return 400 if thingName is missing ", async () => {
        delete thingSchema.thingName;
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is required/i);
      });

      it("should return 400 if thingName not a string", async () => {
        thingSchema.thingName = 123;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/must be a string/i);
      });

      it("should return 400 if thingName empty", async () => {
        thingSchema.thingName = "";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is not allowed to be empty/i);
      });

      it("should return 400 if thingName less than 3 chars", async () => {
        thingSchema.thingName = "a";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/at least 3 characters/i);
      });

      it("should return 400 if thingName longer than 255 chars", async () => {
        thingSchema.thingName =
          "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /less than or equal to 255 characters/i
        );
      });
      it("should return 400 when thingname is already registered", async () => {
        thingSchema.thingName = "750-831";
        await awsThingsController.createThing(thingSchema);
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/already registered/i);
      });

      // Host
      it("should return 400 if host is missing ", async () => {
        delete thingSchema.host;
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is required/i);
      });

      it("should return 400 if host not a string", async () => {
        thingSchema.host = 123;
        const result = await executePostThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/must be a string/i);
      });

      it("should return 400 if host empty", async () => {
        thingSchema.host = "";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is not allowed to be empty/i);
      });

      it("should return 400 if host less than 10 chars", async () => {
        thingSchema.host = "a";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/at least 10 characters/i);
      });

      it("should return 400 if host longer than 255 chars", async () => {
        thingSchema.host =
          "1234567890-1234567890-1234567890-11234567890-1234567890-1234567890-1234567890-234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-1234567890-";
        const result = await executePutThing();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(
          /less than or equal to 255 characters/i
        );
      });

      // others
      it("should return an 401 an non exisitng thing id is provided", async () => {
        const result = await request(server)
          .put("/api/aws/things/" + "5dd65bccd4387dc776cdAAAA")
          .set("x-auth-token", userToken)
          .send(thingSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No Thing found with ID.*/i);
      });

      it("should return an 401 an invalid invalid id is provided", async () => {
        const result = await request(server)
          .put("/api/aws/things/" + "123")
          .set("x-auth-token", userToken)
          .send(thingSchema);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/invalid id/i);
      });

      it("should return 200 and the result should contain _id property and the name is edit of the thing", async () => {
        thingSchema.thingName = "750-880";
        const result = await executePutThing();

        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("_id");
        expect(result.body.thingName).toBe("750-880");
        expect(result.body.certificate).toBe(thingSchema.certificate);
        expect(result.body.caChain).toBe(thingSchema.caChain);
      });

      it("should return 200 and the result should contain _id property", async () => {
        const result = await executePutThing();

        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("_id");
        expect(result.body.thingName).toBe(thingSchema.thingName);
        expect(result.body.certificate).toBe(thingSchema.certificate);
        expect(result.body.caChain).toBe(thingSchema.caChain);
      });
    });

    describe("DELETE /:id", () => {
      beforeEach(async () => {
        storedThing = await awsThingsController.createThing(thingSchema);
      });

      it("should return a 200 and the deleted Things _id", async () => {
        const result = await executeDelete();

        expect(result.status).toBe(200);
        expect(result.text).toMatch(/Successfully/i);
      });

      it("should return a 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeDelete();

        expect(result.status).toBe(401);
      });

      it("should return a 401 if no token is provided", async () => {
        userToken = "";
        const result = await request(server)
          .delete("/api/aws/things/" + storedThing._id)
          .send();

        expect(result.status).toBe(401);
      });

      it("should return an 400 if id is invalid", async () => {
        const result = await request(server)
          .delete("/api/aws/things/" + "123")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });

      it("should return an 400 id doesn't exist in the database", async () => {
        storedThing._id = "5dd65bccd4387dc776cdAAAA";
        const result = await executeDelete();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No AWS Thing found /i);
      });

      it("should return an 400 id doesn't exist in the database", async () => {
        const result = await request(server)
          .delete("/api/aws/things/" + "5dd65bccd4387dc776AAAAAA")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No AWS Thing found /i);
      });
    });
  });

  describe("certifications", () => {
    beforeEach(() => {
      deleteCerts();
    });
    afterEach(() => {
      deleteCerts();
    });

    describe("POST /things/:id/certs", () => {
      describe("authentication", () => {
        it("should return an 401 if no token is provided", async () => {
          const result = await request(server)
            .post("/api/aws/things/5dd65bccd4387dc776cdAAAA/certs")
            .attach(
              "certs",
              path.join(
                __dirname,
                "../../../aws certs/750-831/d6c62e892c-certificate.pem.crt"
              )
            )
            .attach(
              "certs",
              path.join(
                __dirname,
                "../../../aws certs/750-831/d6c62e892c-private.pem.key"
              )
            )
            .attach(
              "certs",
              path.join(
                __dirname,
                "../../../aws certs/750-831/AmazonRootCA1.pem"
              )
            );

          expect(result.status).toBe(401);
          expect(result.error.text).toMatch(/access denied/i);
        });

        it("should return an 401 if an empty token is provided", async () => {
          userToken = "";
          const result = await executePostThingCerts();

          expect(result.status).toBe(401);
          expect(result.error.text).toMatch(/access denied/i);
        });

        it("should return an 401 if an invalid token", async () => {
          userToken = "a";
          const result = await executePostThingCerts();

          expect(result.status).toBe(401);
          expect(result.error.text).toMatch(/Invalid token/i);
        });

        it("should return an 401 if old token is provided", async () => {
          userToken = "5dd65bccd4387dc776cdAAAA";
          const result = await executePostThingCerts();

          expect(result.status).toBe(401);
          expect(result.error.text).toMatch(/Invalid token/i);
        });
      });

      it("should return an 400 not 3 files where given", async () => {
        const thing = await executePostThing();
        result = await request(server)
          .post("/api/aws/things/" + thing.body._id + "/certs")
          .attach(
            "certs",
            path.join(
              __dirname,
              "../../../aws certs/750-831/d6c62e892c-certificate.pem.crt"
            )
          )
          .attach(
            "certs",
            path.join(
              __dirname,
              "../../../aws certs/750-831/d6c62e892c-private.pem.key"
            )
          )
          .set("x-auth-token", userToken);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Incomplete certification files/i);
      });

      it("should return an 400 if an invalid file type is provided", async () => {
        const thing = await executePostThing();
        result = await request(server)
          .post("/api/aws/things/" + thing.body._id + "/certs")
          .attach(
            "certs",
            path.join(
              __dirname,
              "../../../aws certs/750-831/d6c62e892c-certificate.pem.crt"
            )
          )
          .attach(
            "certs",
            path.join(
              __dirname,
              "../../../aws certs/750-831/d6c62e892c-private.pem.key"
            )
          )
          .attach(
            "certs",
            path.join(__dirname, "../../../aws certs/invalid.txt")
          )
          .set("x-auth-token", userToken);

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid certifications/i);
      });

      it("should return an 200 if 3 files where given", async () => {
        const thing = await executePostThing();
        const result = await executePostThingCerts(thing.body._id);
        fs.readdir(certsDirectory, (err, files) => {
          expect(result.status).toBe(200);
          expect(files.length).toBe(3);
        });
      });

      it("should return an 200 if 3 files where given again for an existing thing which has already certs", async () => {
        const thing = await executePostThing();
        await executePostThingCerts(thing.body._id);
        const result = await executePostThingCerts(thing.body._id);
        fs.readdir(certsDirectory, (err, files) => {
          expect(result.status).toBe(200);
          expect(files.length).toBe(3);
        });
      });
    });

    describe("DELETE things/:id/certs", () => {
      beforeEach(async () => {
        storedThing = await awsThingsController.createThing(thingSchema);
      });

      it("should return a 200 and thing without certs properties", async () => {
        const result = await executeDeleteThingCerts();

        expect(result.status).toBe(200);
        expect(result.body).not.toHaveProperty("certificate");
        expect(result.body).not.toHaveProperty("caChain");
        expect(result.body).not.toHaveProperty("privateKey");
      });

      it("should return a 401 if an empty token is provided", async () => {
        userToken = "";
        const result = await executeDeleteThingCerts();

        expect(result.status).toBe(401);
      });

      it("should return a 401 if no token is provided", async () => {
        userToken = "";
        const result = await request(server)
          .delete("/api/aws/things/" + storedThing._id.toString() + "/certs")
          .send();

        expect(result.status).toBe(401);
      });

      it("should return an 400 if id is invalid", async () => {
        const result = await request(server)
          .delete("/api/aws/things/123/certs")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/Invalid ID/i);
      });

      it("should return an 400 id doesn't exist in the database", async () => {
        storedThing._id = "5dd65bccd4387dc776cdAAAA";
        const result = await executeDeleteThingCerts();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No Thing found with ID:*/i);
      });

      it("should return an 400 id doesn't exist in the database", async () => {
        const result = await request(server)
          .delete("/api/aws/things/5dd65bccd4387dc776AAAAAA/certs")
          .set("x-auth-token", userToken)
          .send();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/No Thing found with ID.*/i);
      });
    });
  });
});
