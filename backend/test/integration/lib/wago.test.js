const wago = require("../../../lib/wago");

let plcOne;
let plcTwo;

describe("Hardware Needed! - Wago Libary", () => {
	beforeEach(async () => {
		plcOne = {
			name: "?",
			ip: "192.168.1.4",
			mac: "00:30:de:0a:77:2b",
			user: "admin",
			password: "wago"
		};
		plcTwo = {
			name: "?",
			ip: "192.168.1.10",
			mac: "00:30:de:0a:de:1d",
			user: "admin",
			password: "wago"
		};
	});

	describe("find", () => {
		it("should return two wago devices with ip 10 and 4 at the end", async () => {
			delete plcOne.user;
			delete plcOne.password;
			delete plcTwo.user;
			delete plcTwo.password;
			const result = await wago.find();

			expect(result).toContainEqual(plcOne);
			expect(result).toContainEqual(plcTwo);
		});
	});

	describe("get plcInformation", () => {
		it("Return the plcOne 750-831 with with 5 modules", async () => {
			const result = await wago.getPlcInformation(plcOne);

			expect(result.articleNumber).toMatch(plcOne.articleNumber);
			expect(result.modules.length).toBe(5);
			expect(result.modules).toEqual(expect.arrayContaining(plcOne.modules));
		});

		it("Return the plcTwo 750-831 with with 2 modules", async () => {
			const result = await wago.getPlcInformation(plcTwo);

			expect(result.articleNumber).toMatch(plcTwo.articleNumber);
			expect(result.modules.length).toBe(2);
			expect(result.modules).toEqual(expect.arrayContaining(plcTwo.modules));
		});
	});

	describe("getPlcs", () => {
		it("should return two PLCs with articlenumber, ip, modules and name", async () => {
			const result = await wago.getPlcs();

			expect(result.length).toBe(2);
			expect(result[0]).toHaveProperty("name");
			expect(result[0]).toHaveProperty("articleNumber");
			expect(result[0]).toHaveProperty("modules");
			expect(result[0]).toHaveProperty("mac");
			expect(result[1]).toHaveProperty("name");
			expect(result[1]).toHaveProperty("articleNumber");
			expect(result[1]).toHaveProperty("modules");
			expect(result[1]).toHaveProperty("mac");
		});
	});

	describe("getPlcXmls", () => {
		it("should add the files property with the readed xml files into the given plcs", async () => {
			const plcs = [plcOne, plcTwo];
			const result = await wago.getAllPlcsXmls(plcs);

			expect(result.length).toBe(2);
			expect(result[0]).toHaveProperty("files");
			expect(result[1]).toHaveProperty("files");
		});
	});
});
