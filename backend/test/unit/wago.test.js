const Wago = require("../../models/wago");

let plc;

beforeEach(async () => {
  plc = {
    name: "Bacnet Controller Testrack",
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

describe("validation", () => {
  it("should return an required ip error if ip is not given", () => {
    delete plc.ip;
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/"ip" is required/);
    expect(result.value).not.toHaveProperty("ip");
  });

  it("should return an required ip error if ip is empty", () => {
    plc.ip = "";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/empty/);
  });

  it("should return an min error if ip less than 7 digits", () => {
    plc.ip = "1";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be at least/);
  });

  it("should return an max error if ip is longer than 15 digits", () => {
    plc.ip = "1234567890123456";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(
      /must be less than or equal to/
    );
  });

  it("should return an min error if name less than 3 digits", () => {
    plc.name = "a";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be at least/);
  });

  it("should return an error when name has more than 255 chars", () => {
    plc.name =
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const result = Wago.validate(plc);
    expect(result).toHaveProperty("error");
    expect(result.error.details[0].type).toMatch(/max/);
  });

  it("should return an min error if mac less than 17 digits", () => {
    plc.mac = "AA";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be at least/);
  });

  it("should return an max error if mac is longer than 15 digits", () => {
    plc.mac = "AA:AA:AA:AA:AA:AAA";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(
      /must be less than or equal to/
    );
  });

  it("should return an min error if articleNumber less than 7 digits", () => {
    plc.articleNumber = "1";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be at least/);
  });

  it("should return an max error if articleNumber is longer than 50 digits", () => {
    plc.articleNumber =
      "AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA-AAAAAAAAAA";
    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(
      /must be less than or equal to/
    );
  });

  it("should return an validation error if modules is not an array", () => {
    plc.modules = 123;

    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be an array/);
  });

  it("should return an validation error if files is not an array", () => {
    plc.files = 123;

    const result = Wago.validate(plc);

    expect(result).toHaveProperty("error");
    expect(result.error.details[0].message).toMatch(/must be an array/);
  });
});
