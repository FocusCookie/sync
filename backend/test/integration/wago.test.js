const request = require("supertest");
const { Wago } = require("../../models/wago");
const { User } = require("../../models/users");
const wagoController = require("../../controller/wago");

let server;
let token;
let plc;
let plcWithDetails;
let storedPlc;
let storedPlcId;

describe("Wago API integration test", () => {
  beforeEach(async () => {
    server = require("../../app");
    token = new User({ isAdmin: false }).generateToken();
    plc = {
      name: "?",
      ip: "192.168.1.4",
      mac: "00:30:de:0a:de:1d",
      user: "admin",
      password: "wago"
    };
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
  });

  afterEach(async () => {
    await server.close();
    await Wago.deleteMany({});
    await User.deleteMany({});
  });

  const executeVisuVars = () => {
    return request(server)
      .post("/api/wago/details")
      .set("x-auth-token", token)
      .send(plc);
  };

  const executeStorePlc = () => {
    return request(server)
      .post("/api/wago/")
      .set("x-auth-token", token)
      .send(plcWithDetails);
  };

  const executeGetWagos = () => {
    return request(server)
      .get("/api/wago/")
      .set("x-auth-token", token)
      .send();
  };

  const executePut = () => {
    return request(server)
      .put("/api/wago/" + storedPlcId)
      .set("x-auth-token", token)
      .send(plcWithDetails);
  };

  const executeDelete = () => {
    return request(server)
      .delete("/api/wago/" + storedPlc._id)
      .set("x-auth-token", token)
      .send();
  };

  describe("GET /search", () => {
    it("should return two plcs with ip, name and mac", async () => {
      const result = await request(server)
        .get("/api/wago/search")
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(200);
      expect(result.body.length).toBe(2);
      expect(result.body[0]).toHaveProperty("ip");
      expect(result.body[0]).toHaveProperty("name");
      expect(result.body[0]).toHaveProperty("mac");
    });

    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .get("/api/wago/search")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });
  });

  describe("POST /details", () => {
    it("should return a 401 if token is empty", async () => {
      token = "";

      const result = await executeVisuVars();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return a 401 no token is provided", async () => {
      const result = await request(server)
        .post("/api/wago/details")
        .send(plc);

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return 200 and if the plc object is valid", async () => {
      const result = await executeVisuVars();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("files");
      expect(result.body).toHaveProperty("ip");
      expect(result.body).toHaveProperty("name");
      expect(result.body).not.toHaveProperty("user");
      expect(result.body).not.toHaveProperty("password");
      expect(result.body.files.length).toBe(2);
      expect(result.body.files[0].variables.length).toBe(4);
      expect(result.body.files[1].variables.length).toBe(1);
      expect(result.body.files[0].variables[0]).toHaveProperty("datatype");
      expect(result.body.files[0].variables[0]).toHaveProperty("arti");
      expect(result.body.files[0].variables[0]).toHaveProperty("prgName");
      expect(result.body.files[0].variables[0]).toHaveProperty("varName");
    });

    it("should return 400 if no plc object is provided", async () => {
      plc = "";

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });

    it("should return 400 if given plc doesnt have an ip", async () => {
      delete plc.ip;

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });

    it("should return 400 if given plc doesnt have an user", async () => {
      delete plc.user;

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });

    it("should return 400 if given plc doesnt have an password", async () => {
      delete plc.password;

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });

    it("should return a 400 if given plc user is invalid", async () => {
      plc.user = "";

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });

    it("should return a 400 if given plc password is invalid", async () => {
      plc.password = "";

      const result = await executeVisuVars();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC/);
    });
  });

  describe("GET /", () => {
    afterEach(async () => {
      await Wago.deleteMany({});
    });
    it("should return an empty array if no plc is stored in the database", async () => {
      const result = await executeGetWagos();

      expect(result.status).toBe(200);
      expect(result.body).toStrictEqual([]);
    });

    it("should return the stored plc from the database", async () => {
      const dbPlc = await wagoController.createWago(plcWithDetails);
      const result = await executeGetWagos();

      expect(result.status).toBe(200);
      expect(result.body[0]._id).toMatch(dbPlc._id.toString());
    });
  });

  describe("POST /", () => {
    it("should return a 200 and the given plc including _id", async () => {
      const result = await executeStorePlc();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("_id");
      expect(result.body.ip).toBe(plcWithDetails.ip);
    });

    it("should return a 401 if an invalid token is provided", async () => {
      token = "";
      const result = await executeStorePlc();

      expect(result.status).toBe(401);
    });

    it("should return a 401 if no token is provided", async () => {
      token = "";
      const result = await request(server)
        .post("/api/wago/")
        .send(plcWithDetails);

      expect(result.status).toBe(401);
    });

    it("should return a 400 if plc is already stored", async () => {
      wagoController.createWago(plcWithDetails).then(async () => {
        const result = await executeStorePlc();

        expect(result.status).toBe(400);
        expect(result.error.text).toMatch(/is already registered/);
      });
    });

    it("should return a 400 if ip is not provided in the plc object", async () => {
      delete plcWithDetails.ip;
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/"ip" is required/);
    });

    it("should return a 400 if ip is empty in the plc object", async () => {
      plcWithDetails.ip = "";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/empty/i);
    });

    it("should return an min error if ip less than 7 digits", async () => {
      plcWithDetails.ip = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an max error if ip is longer than 15 digits", async () => {
      plcWithDetails.ip = "1234567890-123456";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an min error if name less than 3 digits", async () => {
      plcWithDetails.name = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an error when name has more than 255 chars", async () => {
      plcWithDetails.name = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
    });

    it("should return an min error if mac less than 17 digits", async () => {
      plcWithDetails.mac = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an max error if mac is longer than 17 digits", async () => {
      plcWithDetails.mac = "1234567890-1234567";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an min error if articleNumber less than 7 digits", async () => {
      plcWithDetails.articleNumber = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an max error if articleNumber is longer than 50 digits", async () => {
      plcWithDetails.articleNumber =
        "1234567890-1234567890-1234567890-1234567890-1234567890";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an validation error if modules is not an array", async () => {
      plcWithDetails.modules = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be an array/);
    });

    it("should return an validation error if files is not an array", async () => {
      plcWithDetails.files = "1";
      const result = await executeStorePlc();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be an array/);
    });
  });

  describe("GET /:id", () => {
    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .get("/api/wago/1234")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return an 401 if token is empty", async () => {
      const result = await request(server)
        .get("/api/wago/1234")
        .set("x-auth-token", "")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return an 401 if token is invalid", async () => {
      const result = await request(server)
        .get("/api/wago/1234")
        .set("x-auth-token", "a")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 400 if id is invalid", async () => {
      const result = await request(server)
        .get("/api/wago/123")
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid ID/i);
    });

    it("should return an 200 if  id is valid and PLC is in DB", async () => {
      const dbPlc = await wagoController.createWago(plcWithDetails);

      const result = await request(server)
        .get("/api/wago/" + dbPlc._id.toString())
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(200);
      expect(result.body._id).toMatch(dbPlc._id.toString());
    });

    it("should return an 400 id doesn't exist in the database", async () => {
      const result = await request(server)
        .get("/api/wago/" + "5dd65bccd4387dc776AAAAAA")
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/No PLC found /i);
    });
  });

  describe("PUT /:id", () => {
    beforeEach(async () => {
      storedPlc = await wagoController.createWago(plcWithDetails);
      storedPlcId = storedPlc._id.toString();
    });

    it("should return an 401 if no token is provided", async () => {
      const result = await request(server)
        .put("/api/wago/" + storedPlc._id.toString())
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return an 401 if token is empty", async () => {
      token = "";
      const result = await executePut();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });

    it("should return an 401 if token is invalid", async () => {
      token = "a";
      const result = await executePut();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Invalid token/i);
    });

    it("should return an 400 if id is invalid", async () => {
      storedPlcId = "123";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid ID/i);
    });

    it("should return an 400 id doesn't exist in the database", async () => {
      storedPlcId = "5dd65bccd4387dc776cd3215";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/No PLC found /i);
    });

    it("should return a 400 if ip is not provided in the plc object", async () => {
      delete plcWithDetails.ip;
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/"ip" is required/);
    });

    it("should return a 400 if ip is empty in the plc object", async () => {
      plcWithDetails.ip = "";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/empty/i);
    });

    it("should return an 400 min error if ip less than 7 digits", async () => {
      plcWithDetails.ip = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an 400 max error if ip is longer than 15 digits", async () => {
      plcWithDetails.ip = "1234567890-123456";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an 400 min error if name less than 3 digits", async () => {
      plcWithDetails.name = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an 400 error when name has more than 255 chars", async () => {
      plcWithDetails.name = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
    });

    it("should return an 400 min error if mac less than 17 digits", async () => {
      plcWithDetails.mac = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an 400 max error if mac is longer than 17 digits", async () => {
      plcWithDetails.mac = "1234567890-1234567";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an 400 min error if articleNumber less than 7 digits", async () => {
      plcWithDetails.articleNumber = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be at least/);
    });

    it("should return an 400 max error if articleNumber is longer than 50 digits", async () => {
      plcWithDetails.articleNumber =
        "1234567890-1234567890-1234567890-1234567890-1234567890";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be less than or equal to/);
    });

    it("should return an 400 validation error if modules is not an array", async () => {
      plcWithDetails.modules = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be an array/);
    });

    it("should return an 400 validation error if files is not an array", async () => {
      plcWithDetails.files = "1";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/must be an array/);
    });

    it("should return an 400 if given plc has an id parameter", async () => {
      plcWithDetails._id = "123";
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid PLC Object - _id paramter/);
    });

    it("should return an 400 if new IP is already used in database for another plc", async () => {
      // first DB entry is with ip .4
      // create a second db entry with a different ip
      plcWithDetails.ip = "192.168.1.100";
      await wagoController.createWago(plcWithDetails);

      // try to first entry ip to the second entry ip
      const result = await executePut();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/already registered/i);
    });
  });

  describe("DELETE /:id", () => {
    beforeEach(async () => {
      storedPlc = await wagoController.createWago(plcWithDetails);
    });

    it("should return a 200 and the given plc including _id", async () => {
      const result = await executeDelete();

      expect(result.status).toBe(200);
      expect(result.text).toMatch(/Successfully/i);
    });

    it("should return a 401 if an invalid token is provided", async () => {
      token = "";
      const result = await executeDelete();

      expect(result.status).toBe(401);
    });

    it("should return a 401 if no token is provided", async () => {
      token = "";
      const result = await request(server)
        .delete("/api/wago/" + storedPlc._id)
        .send();

      expect(result.status).toBe(401);
    });

    it("should return an 400 if id is invalid", async () => {
      const result = await request(server)
        .delete("/api/wago/" + "123")
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/Invalid ID/i);
    });

    it("should return an 400 id doesn't exist in the database", async () => {
      storedPlc._id = "5dd65bccd4387dc776cdAAAA";
      const result = await executeDelete();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/No PLC found /i);
    });

    it("should return an 400 id doesn't exist in the database", async () => {
      const result = await request(server)
        .delete("/api/wago/" + "5dd65bccd4387dc776AAAAAA")
        .set("x-auth-token", token)
        .send();

      expect(result.status).toBe(400);
      expect(result.error.text).toMatch(/No PLC found /i);
    });
  });
});
