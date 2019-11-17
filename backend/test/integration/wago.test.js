const request = require("supertest");
const { User } = require("../../models/users");

let server;
let token;

describe("Wago API integration test", () => {
  beforeEach(async () => {
    server = require("../../app");
    token = new User({ isAdmin: false }).generateToken();
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  describe("allPlcsInNetwork", () => {
    it("should return two plcs with ip, name and mac", async () => {
      const result = await request(server)
        .get("/api/wago/allPlcsInNetwork")
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
        .get("/api/wago/allPlcsInNetwork")
        .send();

      expect(result.status).toBe(401);
      expect(result.error.text).toMatch(/Access denied/);
    });
  });
});
