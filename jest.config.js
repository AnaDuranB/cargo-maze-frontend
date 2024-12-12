module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    coverageDirectory: './coverage',
    collectCoverage: true,
    coverageReporters: ['lcov', 'text', 'json'],
    collectCoverageFrom: [
        '**/jstest/**'
    ],
    moduleNameMapper: {
        '^msal$': '<rootDir>/__mocks__/msal.js',
        '^sockjs-client$': '<rootDir>/__mocks__/sockjs-client.js',// Asegúrate de que msal apunte a tu mock
    },
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    
};
