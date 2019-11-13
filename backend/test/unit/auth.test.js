const auth = require("../../middleware/auth");
const httpMocks = require("node-mocks-http");

let adminToken;
let userToken;
let req;
let res;

describe("auth middleware unittest", () => {
  beforeEach(() => {
    adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM4MDY3Mzg2YjQ2YTI3N2JkNmE5MTciLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE1NzMzOTAwMzV9.21NblEEw8TmgdvgEl5WLiQdMA2QQrPOrnqXHHQh8DWQ`;
    userToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM2ZTNhMDQxNzIzNWMxMThhMzc1ZGYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTczMzE1NDg4fQ.r5iTRau3FuJu0w5YkSDdwttoiQBmdeNerGXC8mXTBw8`;

    res = httpMocks.createResponse();
    req = httpMocks.createRequest();
  });

  it("should add a valid user object with admin:true to the request if an admin token is passed ", () => {
    req._setHeadersVariable("x-auth-token", adminToken);
    auth(req, res, () => {
      expect(res.user.isAdmin).toBe(true);
      expect(res.user).toHaveProperty("_id");
      expect(res.user).toHaveProperty("isAdmin");
      expect(res.user).toHaveProperty("iat");
    });
  });

  it("should add a valid user object with admin:false to the request if an token without admin rights is passed ", () => {
    req._setHeadersVariable("x-auth-token", userToken);
    auth(req, res, () => {
      expect(res.user.isAdmin).toBe(false);
      expect(res.user).toHaveProperty("_id");
      expect(res.user).toHaveProperty("isAdmin");
      expect(res.user).toHaveProperty("iat");
    });
  });

  it("should an error if an invalid token is passed ", () => {
    req._setHeadersVariable("x-auth-token", userToken);
    auth(req, res, () => {
      expect(res._getData()).toMatch(/Invalid token/);
      expect(res._getStatusCode()).toBe(400);
    });
  });

  it("should an error if no token is passed", () => {
    auth(req, res, () => {
      expect(res._getData()).toMatch(/Invalid token/);
      expect(res._getStatusCode()).toBe(400);
    });
  });
});
