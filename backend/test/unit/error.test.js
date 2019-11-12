const errorMiddleware = require("../../middleware/error");
const httpMocks = require("node-mocks-http");

describe("auth unittest", () => {
  beforeEach(() => {
    res = httpMocks.createResponse();
  });

  it("it should return 500 if an error is passed", () => {
    errorMiddleware(new Error("Unittest Error"), null, res, null);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toMatch(/Something broke/);
  });

  it("it should pass to next() if no error is passed", () => {
    let passedNext = false;
    errorMiddleware(null, null, null, () => {
      passedNext = true;
    });

    expect(passedNext).toBe(true);
  });
});
