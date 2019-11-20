const request = require("supertest");
const { User } = require("../../models/users");

let server;
let token;
let plc;

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
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  const executeVisuVars = () => {
    return request(server)
      .post("/api/wago/details")
      .set("x-auth-token", token)
      .send(plc);
  };

  describe("allPlcsInNetwork", () => {
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

  describe("details", () => {
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
      expect(result.body).not.toHaveProperty("username");
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
});
