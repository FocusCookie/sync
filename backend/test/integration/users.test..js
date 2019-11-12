const bcrypt = require("bcrypt");
const request = require("supertest");
const { User } = require("../../models/users");
const userController = require("../../controller/users");
const config = require("config");
const jwt = require("jsonwebtoken");

let userSchema;
let adminToken;
let userToken;
let newUserSchema;

describe("Users", () => {
  beforeEach(async () => {
    server = require("../../app");
    userSchema = {
      name: "user",
      email: "user@b.com",
      password: "userPassword",
      repeat_password: "userPassword"
    };
    newUserSchema = {
      name: "API User",
      email: "api@b.com",
      password: "apiUserPassword",
      repeat_password: "apiUserPassword"
    };

    adminToken = new User({ isAdmin: true }).generateToken();

    await userController.createUser(userSchema);
    const userTokenRequest = await request(server)
      .post("/api/auth")
      .type("json")
      .send({ email: userSchema.email, password: userSchema.password });
    userToken = userTokenRequest.res.text;
  });

  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });

  const executeMe = () => {
    return request(server)
      .get("/api/users/me")
      .set("x-auth-token", userToken)
      .send();
  };

  const executeCreation = () => {
    return request(server)
      .post("/api/users/")
      .set("x-auth-token", adminToken)
      .send(newUserSchema);
  };

  describe("/me", () => {
    it("should return a 200 if a valid token is provided to an existing user in db", async () => {
      const result = await executeMe();

      expect(result.status).toBe(200);
    });

    it("should return a 400 if invalid token is provided", async () => {
      userToken = "";
      const result = await executeMe();

      expect(result.status).toBe(401);
    });

    it("should return a 400 if an token is provided where the user doesn't exists anymore", async () => {
      userToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM2ZTNhMDQxNzIzNWMxMThhMzc1ZGYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTczMzE1NDg4fQ.r5iTRau3FuJu0w5YkSDdwttoiQBmdeNerGXC8mXTBw8";
      const result = await executeMe();

      expect(result.status).toBe(400);
    });
  });

  describe("/", () => {
    it("should be return a 403 if the token is not from an admin user", async () => {
      adminToken = userToken;

      const result = await executeCreation();

      expect(result.status).toBe(403);
    });

    it("should return a 200 and the user should be created without admin rights", async () => {
      const result = await executeCreation();
      const resBody = JSON.parse(result.res.text);

      const userDb = await User.findOne({ email: resBody.email });

      expect(result.status).toBe(200);
      expect(resBody).toHaveProperty("name", newUserSchema.name);
      expect(resBody).toHaveProperty("email", newUserSchema.email);
      expect(resBody).toHaveProperty("email", newUserSchema.email);
      expect(userDb.isAdmin).toBe(false);
    });

    it("should return a 400 if no name is provided", async () => {
      delete newUserSchema.name;
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/name/);
    });

    it("should return a 400 if name is empty ", async () => {
      newUserSchema.name = "";
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/name/);
    });

    it("should return a 400 if no email is provided", async () => {
      delete newUserSchema.email;
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/email/);
    });

    it("should return a 400 if email is empty ", async () => {
      newUserSchema.email = "";
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/email/);
    });

    it("should return a 400 if no password is provided", async () => {
      delete newUserSchema.password;
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/password/);
    });

    it("should return a 400 if password is empty ", async () => {
      newUserSchema.password = "";
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/password/);
    });

    it("should return a 400 if repeat_password is empty ", async () => {
      newUserSchema.repeat_password = "";
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/repeat_password/);
    });

    it("should return a 400 if repeat_password and password are different ", async () => {
      newUserSchema.repeat_password = "123456";
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(/repeat_password/);
    });

    it("should return a 400 if user already exists", async () => {
      newUserSchema = userSchema;
      const result = await executeCreation();
      const resBody = result.res.text;

      expect(result.status).toBe(400);
      expect(resBody).toMatch(newUserSchema.email);
    });
  });
});

// body = res.res.text;
// resError = res.req.res.text;
// console.log(res.req.res.text);
