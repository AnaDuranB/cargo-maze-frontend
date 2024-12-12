import login from '../../src/jstest/login';
import apiClient from '../../src/jstest/apiclient';
import authConfig from '../../src/jstest/authConfig';

jest.mock('../src/jstest/apiclient', () => ({
    verifyNickname: jest.fn(),
    login: jest.fn(),
}));

jest.mock('../src/jstest/authConfig', () => ({
    acquireTokenRedirect: jest.fn(),
}));

Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
});

beforeEach(() => {
    sessionStorage.clear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
});

describe('login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('initializeUserSession: should create a new player if not exists', async () => {
        apiClient.verifyNickname.mockResolvedValue(null);
        apiClient.login.mockResolvedValue();

        await login.initializeUserSession();

        expect(apiClient.verifyNickname).toHaveBeenCalled();
        expect(apiClient.login).toHaveBeenCalled();
    });

    test('initializeUserSession: should not create player if exists', async () => {
        apiClient.verifyNickname.mockResolvedValue(true); 

        await login.initializeUserSession();

        expect(apiClient.verifyNickname).toHaveBeenCalled();
        expect(apiClient.login).not.toHaveBeenCalled();
    });

    test('initializeUserSession: should handle InteractionRequiredAuthError', async () => {
        const error = new Error("Interaction required");
        error.name = "InteractionRequiredAuthError";
        apiClient.verifyNickname.mockRejectedValue(error);

        await login.initializeUserSession();

        expect(authConfig.acquireTokenRedirect).toHaveBeenCalledWith({
            scopes: ["User.Read"],
        });
        expect(console.warn).toHaveBeenCalledWith("Se requiere interacción del usuario para adquirir el token.");
    });

    test('initializeUserSession: should handle general errors', async () => {
        const error = new Error("General error");
        apiClient.verifyNickname.mockRejectedValue(error);

        await login.initializeUserSession();

        expect(console.error).toHaveBeenCalledWith("Error al inicializar la sesión:", error);
    });

    test('getDisplayName: should return nickname from sessionStorage', () => {
        sessionStorage.setItem("nickname", "player1");
        const displayName = login.getDisplayName();
        expect(displayName).toBe("player1");
    });
});
