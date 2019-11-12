const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const httpMocks = require("node-mocks-http");

let adminToken;
let userToken;
let req;
let res;
let passedAdmin;

describe("auth unittest", () => {
  beforeEach(() => {
    adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM4MDY3Mzg2YjQ2YTI3N2JkNmE5MTciLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE1NzMzOTAwMzV9.21NblEEw8TmgdvgEl5WLiQdMA2QQrPOrnqXHHQh8DWQ`;
    userToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM2ZTNhMDQxNzIzNWMxMThhMzc1ZGYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTczMzE1NDg4fQ.r5iTRau3FuJu0w5YkSDdwttoiQBmdeNerGXC8mXTBw8`;

    res = httpMocks.createResponse();
    req = httpMocks.createRequest();
    passedAdmin = false;
  });

  afterEach(() => {
    req = null;
    res = null;
  });

  it("should pass to the next() if isAdmin is on req.user ", () => {
    req._setHeadersVariable("x-auth-token", adminToken);
    auth(req, res, () => {
      admin(req, res, () => {
        passedAdmin = true;
      });
    });

    expect(passedAdmin).toBe(true);
  });

  it("should return an 403 if an token is passed which has no isAdmin = true", () => {
    req._setHeadersVariable("x-auth-token", userToken);
    auth(req, res, null);
    admin(req, res, null);
    expect(res._getStatusCode()).toBe(403);
    expect(res._getData()).toMatch(/Access denied/);
  });
});
