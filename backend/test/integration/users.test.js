const bcrypt = require("bcrypt");
const request = require("supertest");
const { User } = require("../../models/users");
const userController = require("../../controller/users");
const config = require("config");
const jwt = require("jsonwebtoken");

const adminSchema = {
	name: "admin",
	email: "admin@b.com",
	password: "adminPassword",
	repeat_password: "adminPassword"
};
let userSchema;
let login = { email: adminSchema.email, password: adminSchema.password };

describe("Users", () => {
	beforeEach(async () => {
		server = require("../../app");
		userSchema = {
			name: "user",
			email: "user@b.com",
			password: "userPassword",
			repeat_password: "userPassword"
		};
		await userController.createUser(adminSchema);
		const tokenRequest = await request(server)
			.post("/api/auth")
			.type("json")
			.send(login);

		token = tokenRequest.res.text;
	});

	afterEach(async () => {
		await server.close();
		await User.deleteMany({});
	});

	const executeMe = () => {
		return request(server)
			.get("/api/users/me")
			.set("x-auth-token", token)
			.send();
	};

	const executeCreation = () => {
		return request(server)
			.post("/api/users/")
			.set("x-auth-token", token)
			.send(userSchema);
	};

	describe("/me", () => {
		it("should return a 200 if a valid token is provided to an existing user in db", async () => {
			const result = await executeMe();

			expect(result.status).toBe(200);
		});

		it("should return a 400 if invalid token is provided", async () => {
			token = "";
			const result = await executeMe();

			expect(result.status).toBe(401);
		});

		it("should return a 400 if an token is provided where the user doesn't exists anymore", async () => {
			token =
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGM2ZTNhMDQxNzIzNWMxMThhMzc1ZGYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNTczMzE1NDg4fQ.r5iTRau3FuJu0w5YkSDdwttoiQBmdeNerGXC8mXTBw8";
			const result = await executeMe();

			expect(result.status).toBe(400);
		});
	});

	describe("/", () => {
		it("should return a 200 if the user is successfully created", async () => {
			const result = await executeCreation();
			const resBody = JSON.parse(result.res.text);

			expect(result.status).toBe(200);
			expect(resBody).toHaveProperty("name", userSchema.name);
			expect(resBody).toHaveProperty("email", userSchema.email);
		});

		it("should return a 400 if no name is provided", async () => {
			delete userSchema.name;
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/name/);
		});

		it("should return a 400 if name is empty ", async () => {
			userSchema.name = "";
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/name/);
		});

		it("should return a 400 if no email is provided", async () => {
			delete userSchema.email;
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/email/);
		});

		it("should return a 400 if email is empty ", async () => {
			userSchema.email = "";
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/email/);
		});

		it("should return a 400 if no password is provided", async () => {
			delete userSchema.password;
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/password/);
		});

		it("should return a 400 if password is empty ", async () => {
			userSchema.password = "";
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/password/);
		});

		it("should return a 400 if repeat_password is empty ", async () => {
			userSchema.repeat_password = "";
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/repeat_password/);
		});

		it("should return a 400 if repeat_password and password are different ", async () => {
			userSchema.repeat_password = "123456";
			const result = await executeCreation();
			const resBody = result.res.text;

			expect(result.status).toBe(400);
			expect(resBody).toMatch(/repeat_password/);
		});
	});
});

// body = res.res.text;
// resError = res.req.res.text;
// console.log(res.req.res.text);
