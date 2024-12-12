import apiClient from '../src/jstest/apiclient';
global.$ = jest.fn().mockImplementation(() => Promise.resolve({}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('apiClient', () => {
    const mockUrl = "http://localhost:8080/cargoMaze";

    // Test para obtener el estado del tablero de la sesión de juego
    test('getGameSessionBoard: should fetch game session board state', async () => {
        // Mock de la función fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ boardState: 'mockData' }),
            })
        );
        
        // Llamada al método getGameSessionBoard de apiClient
        const result = await apiClient.getGameSessionBoard('mockSessionId');
        
        // Verificar el resultado
        expect(result).toEqual({ boardState: 'mockData' });
        
        // Verificar que fetch haya sido llamado con la URL correcta
        expect(fetch).toHaveBeenCalledWith(`${mockUrl}/sessions/mockSessionId/board/state`);
    });

    // Test para verificar que el nickname es válido
    test('verifyNickname: should return true if nickname is valid', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            })
        );

        const result = await apiClient.verifyNickname('testUser');
        expect(result).toBe(true);
    });

    // Test para verificar que el nickname no es válido
    test('verifyNickname: should return null if nickname is not valid', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
            })
        );

        const result = await apiClient.verifyNickname('testUser');
        expect(result).toBeNull();
    });
});
