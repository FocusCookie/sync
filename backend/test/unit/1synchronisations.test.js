const Sync = require("../../models/synchronisations");
const WagoController = require("../../controller/wago");
const AwsThingController = require("../../controller/awsThings");
const path = require("path");

let testSync;
const certsDirectory = path.join(__dirname, "../", "../", "certs/aws/");
plcSchema = {
  name: "Bacnet 750-831 Testrack",
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
thingSchema = {
  thingName: "750-831",
  host: "afltduprllds9-ats.iot.us-east-2.amazonaws.com"
};

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

describe("Synchronisation Model Functions", () => {
  beforeEach(async () => {
    const plc = await WagoController.createWago(plcSchema);

    const certs = {
      certificate: path.join(
        __dirname,
        "../../../aws certs/750-831/d6c62e892c-certificate.pem.crt"
      ),
      caChain: path.join(
        __dirname,
        "../../../aws certs/750-831/AmazonRootCA1.pem"
      ),
      privateKey: path.join(
        __dirname,
        "../../../aws certs/750-831/d6c62e892c-private.pem.key"
      )
    };

    /* await awsThingsController
      .addCertsToThing(thing._id.toString(), certs)
      .catch(err => {
        debug("Error while creating test certs to thing", err);
      }); */

    testSync = {
      _id: "5deb8976507d81e1b429b381",
      plcId: "plcId",
      cloudProvider: "aws",
      cloudOptionsId: "clodID",
      interval: 3000
    };
    console.log("BEFOR ", testSync);
  });

  describe("createIntervalInstance", () => {
    /* describe("invalid ids", () => {
      it("should return invalid id error if the given synchronisation id is invalid", () => {
        let statusTrueSync = testSync;
        statusTrueSync._id = "1234";
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });

      it("should return invalid id error if the given synchronisation id not a string", () => {
        let statusTrueSync = testSync;
        statusTrueSync._id = false;
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });

      it("should return invalid id error if the given plcId id is invalid", () => {
        let statusTrueSync = testSync;
        statusTrueSync.plcId = "1234";
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });

      it("should return invalid id error if the given plcId id not a string", () => {
        let statusTrueSync = testSync;
        statusTrueSync.plcId = false;
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });

      it("should return invalid id error if the given cloudOptionsId id is invalid", () => {
        let statusTrueSync = testSync;
        statusTrueSync.cloudOptionsId = "1234";
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });

      it("should return invalid id error if the given cloudOptionsId id not a string", () => {
        let statusTrueSync = testSync;
        statusTrueSync.cloudOptionsId = false;
        const result = Sync.createIntervalInstance(statusTrueSync);

        expect(result.message).toMatch(/invalid.*id/i);
      });
    }); */

    it("should return an Object with the synchronisationId, intervalInstance and the intervalTime", () => {
      console.log("testSync ", testSync);
      const result = Sync.createIntervalInstance(testSync);
      console.log("result ", result);

      expect(result).toHaveProperty("synchronisationId");
      expect(result).toHaveProperty("intervalInstance");
      expect(result).toHaveProperty("intervalTime");
    });

    /* it("should return invalid synchronisation if no sync is provided", () => {
      const result = Sync.createIntervalInstance();

      expect(result.message).toMatch(/invalid synchronisation/i);
    });

    it("should return invalid synchronisation if provided sync is not an object", () => {
      const result = Sync.createIntervalInstance(123);

      expect(result.message).toMatch(/invalid synchronisation/i);
    });

    it("should return invalid synchronisation if provided sync is not an object", () => {
      let statusTrueSync = testSync;
      statusTrueSync.status = true;
      const result = Sync.createIntervalInstance(statusTrueSync);

      expect(result.message).toMatch(/already active/i);
    }); */
  });

  /* describe("getIntervals", () => {
    it("should return an array with one synchronisation including the interval instances property", () => {
      Sync.createIntervalInstance(testSync);
      const result = Sync.getIntervals();

      expect(result.length).toBe(2);
      expect(result[0].synchronisationId).toBe(testSync._id);
    });
  });

  describe("deleteInterval", () => {
    it("should return array with one element after deletion", () => {
      const result = Sync.deleteInterval(testSync._id);

      expect(result.length).toBe(1);
    });
  }); */
});
