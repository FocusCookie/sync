const request = require("supertest");
const { User } = require("../../models/users");

let token;
let user = {
	name: "name",
	email: "a@b.com",
	password: "password",
	repeat_password: "password"
};

describe("auth middleware", () => {
	beforeEach(async () => {
		server = require("../../app");
		token = new User().generateToken();
	});

	afterEach(async () => {
		await server.close();
	});

	const execute = () => {
		return request(server)
			.post("/api/users")
			.set("x-auth-token", token)
			.send();
	};
});
