import authConfig from '../../src/jstest/authConfig';
const { PublicClientApplication } = require('../../__mocks__/msal');  // Importa el mock

jest.mock('../../src/js/login', () => ({
    initializeUserSession: jest.fn(),
}));

jest.mock('../../__mocks__/msal', () => {
    return {
        PublicClientApplication: jest.fn().mockImplementation(() => {
            return {
                loginPopup: jest.fn().mockResolvedValue({ account: { username: 'testUser' } }),
                getAllAccounts: jest.fn().mockReturnValue([{ username: 'mockUser' }]),
                getAccountByUsername: jest.fn().mockReturnValue({ username: 'mockUser' }),
                acquireTokenSilent: jest.fn().mockResolvedValue({ accessToken: 'mockAccessToken' }),
                acquireTokenRedirect: jest.fn().mockResolvedValue({ accessToken: 'mockAccessToken' })
            };
        })
    };
});

beforeEach(() => {
    // Mock para evitar errores con window.location.href en jsdom
    delete window.location;
    window.location = { href: '', assign: jest.fn(), replace: jest.fn() };

    // Inicializa el objeto MSAL en la configuración con el mock
    authConfig.myMSALObj = new PublicClientApplication();

    // Mock de console.log y console.error
    console.log = jest.fn();
    console.error = jest.fn();
});

test('signIn: should not throw error', async () => {
    // Llamada a la función signIn y asegurarse de que no cause errores
    await expect(authConfig.signIn()).resolves.not.toThrow();
});
