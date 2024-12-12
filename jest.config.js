module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    coverageDirectory: './coverage',
    collectCoverage: true,
    coverageReporters: ['lcov', 'text', 'json'],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",  // Incluir todos los archivos .js, .jsx, .ts, .tsx en src
        "!src/js/**/*",               // Excluir la carpeta 'js' dentro de src
        "tests/**/*.{js,jsx,ts,tsx}", // Incluir los archivos de prueba
    ],
    moduleNameMapper: {
        '^msal$': '<rootDir>/__mocks__/msal.js',
        '^sockjs-client$': '<rootDir>/__mocks__/sockjs-client.js',// Asegúrate de que msal apunte a tu mock
    },
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    
};
