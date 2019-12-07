const Sync = require("../../models/synchronisations");

const testSync = {
  status: false,
  _id: "5deb8976507d81e1b429b381",
  plcId: "5de3c948ff3ee49cdcc73e8b",
  cloudProvider: "aws",
  cloudOptionsId: "5deb895c507d81e1b429b380",
  interval: 3000,
  created: "2019-12-07T11:13:58.152Z",
  __v: 0
};

describe("Synchronisation Model Functions", () => {
  describe("createInterval", () => {
    it("should return an Object with the synchronisationId, intervalInstance and the intervalTime", () => {
      const result = Sync.createInterval(testSync);

      expect(result).toHaveProperty("synchronisationId");
      expect(result).toHaveProperty("intervalInstance");
      expect(result).toHaveProperty("intervalTime");
    });

    it("should return invalid synchronisation if no sync is provided", () => {
      const result = Sync.createInterval();

      expect(result.message).toMatch(/invalid synchronisation/i);
    });

    it("should return invalid synchronisation if provided sync is not an object", () => {
      const result = Sync.createInterval(123);

      expect(result.message).toMatch(/invalid synchronisation/i);
    });

    it("should return invalid synchronisation if provided sync is not an object", () => {
      let statusTrueSync = testSync;
      statusTrueSync.status = true;
      const result = Sync.createInterval(statusTrueSync);

      expect(result.message).toMatch(/already active/i);
    });
  });

  describe("getIntervals", () => {
    it("should return an array with one synchronisation including the interval instances property", () => {
      Sync.createInterval(testSync);
      const result = Sync.getIntervals();

      expect(result.length).toBe(1);
      expect(result[0].synchronisationId).toBe(testSync._id);
    });
  });

  describe("deleteInterval", () => {
    it("should return an empty array if only one sync intervall was stored and deleted after", () => {
      const result = Sync.deleteInterval(testSync._id);

      expect(result.length).toBe(0);
    });
  });
});
