const User = require("../../models/users");

let usermodel;

beforeEach(async () => {
	usermodel = {
		name: "username",
		email: "a@a.com",
		password: "Password123",
		repeat_password: "Password123"
	};
});

describe("validation", () => {
	it("FIRST return an required error when name is missing", () => {
		delete usermodel.name;
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.value).not.toHaveProperty("name");
	});

	it("return an required error when email is missing", () => {
		delete usermodel.email;
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.value).not.toHaveProperty("email");
	});

	it("return an required error when password is missing", () => {
		delete usermodel.password;
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.value).not.toHaveProperty("password");
	});

	it("return an object witout repeat_password when repeat is missing", () => {
		delete usermodel.repeat_password;
		const result = User.validate(usermodel);
		expect(result.value).not.toHaveProperty("repeat_password");
	});

	it("should return an at least error when name has less than 3 chars", () => {
		usermodel.name = "a";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/min/);
	});

	it("should return an must be less error when name has more than 50 chars", () => {
		usermodel.name =
			"aaaaaaaaaabbbbbbbbbbaaaaaaaaaabbbbbbbbbbaaaaaaaaaabbbbbbbbbbaaaaaaaaaabbbbbbbbbbaaaaaaaaaabbbbbbbbbbaaaaaaaaaabbbbbbbbbb";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/max/);
	});

	it("should return an at least error when email has less than 5 chars", () => {
		usermodel.email = "a";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/min/);
	});

	it("should return an must be less error when name has more than 255 chars", () => {
		usermodel.email =
			"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/max/);
	});

	it("should return an at least error when password has less than 5 chars", () => {
		usermodel.password = "a";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/min/);
	});

	it("should return an must be less error when name has more than 255 chars", () => {
		usermodel.password =
			"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
		const result = User.validate(usermodel);
		expect(result).toHaveProperty("error");
		expect(result.error.details[0].type).toMatch(/max/);
	});

	it("should return an at  error when password repeat doesnt match password", () => {
		usermodel.repeat_password = "a";
		const result = User.validate(usermodel);
		expect(result.value.repeat_password).not.toBe(usermodel.password);
	});
});

/* [ { message: '"name" length must be at least 3 characters long',
path: [ 'name' ],
type: 'string.min',
context:
 { limit: 3,
   value: 'a',
   encoding: undefined,
   label: 'name',
   key: 'name' } } ] */
