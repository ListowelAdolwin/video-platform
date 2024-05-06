export default {
	testEnvironment: "node",
	transform: {
		"^.+\\.mjs$": "babel-jest",
	},
	testMatch: ["<rootDir>/__tests__/*.test.mjs"],
};
