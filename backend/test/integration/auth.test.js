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
let login;

describe("Auth", () => {
	beforeEach(async () => {
		server = require("../../app");
		user = await userController.createUser(userSchema);
		login = {
			email: userSchema.email,
			password: userSchema.password
		};
	});

	afterEach(async () => {
		await server.close();
		await User.deleteMany({});
	});

	const executeLogin = () => {
		return request(server)
			.post("/api/auth")
			.type("json")
			.send(login);
	};

	describe("/auth", () => {
		it("should return an 200 and a valid login if user exists", async () => {
			const res = await executeLogin();

			const token = res.res.text;
			const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

			expect(res.status).toBe(200);
			expect(decoded).not.toBe(undefined);
		});

		it("should return an 400 if login has no email property ", async () => {
			delete login.email;
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});

		it("should return an 400 if login has no password property ", async () => {
			delete login.password;
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});

		it("should return an 400 if email doens't exists in database", async () => {
			login.email = "z@z.com";
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});

		it("should return an 400 if password is incorrect", async () => {
			login.password = "aaaaaaaaaa";
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});

		it("should return an 400 if email is an empty", async () => {
			login.email = "";
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});

		it("should return an 400 if password is empty", async () => {
			login.password = "";
			const res = await executeLogin();

			expect(res.status).toBe(400);
		});
	});
});

// body = res.res.text;
// resError = res.req.res.text;
// console.log(res.req.res.text);
