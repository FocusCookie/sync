const request = require("supertest");
const { User } = require("../../models/users");
const userController = require("../../controller/users");
const config = require("config");
const jwt = require("jsonwebtoken");

const userSchema = {
	name: "name",
	email: "a@b.com",
	password: "password",
	repeat_password: "password"
};

let token;
let admin;

describe("Auth", () => {
	beforeEach(async () => {
		server = require("../../app");
		User.find({ email: config.get("adminEmail") }).then(result =>
			console.log("HIER ", result)
		);
		admin = {
			email: config.get("adminEmail"),
			password: config.get("adminPassword")
		};
	});

	afterEach(async () => {
		await server.close();
		await User.deleteMany({});
	});

	describe("/me", () => {
		beforeEach(async () => {
			const tokenRequest = request(server)
				.post("/api/auth")
				.type("json")
				.send(admin);
		});

		const executeMe = () => {
			return request(server)
				.get("/api/users/me")
				.set("x-auth-token", token);
		};

		it("should return a 200 if a valid token is provided to an existing user in db", async () => {
			const res = await executeMe();

			expect(res.status).toBe(200);
		});
	});
});

// body = res.res.text;
// resError = res.req.res.text;
// console.log(res.req.res.text);
