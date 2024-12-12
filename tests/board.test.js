// import board  from '../src/jstest/board';

// import sessionMenu from '../src/jstest/sessionMenu';
// import apiClient from '../src/jstest/apiclient';

// import { jest } from '@jest/globals';


// // Mock dependencies
// const mockApiClient = {
//     getGameSessionBoard: jest.fn(),
//     getPlayersInSession: jest.fn(),
//     removePlayerFromSession: jest.fn()
// };

// const mockStompClient = {
//     send: jest.fn(),
//     connect: jest.fn(),
//     subscribe: jest.fn(),
//     over: jest.fn().mockReturnThis()
// };

// const mockSessionStorage = {
//     getItem: jest.fn(),
//     removeItem: jest.fn(),
//     setItem: jest.fn()
// };

// // Mock global objects
// global.sessionStorage = mockSessionStorage;
// global.Stomp = mockStompClient;
// global.SockJS = jest.fn().mockReturnValue({});
// global.document = {
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     getElementById: jest.fn()
// };
// global.window = {
//     location: { href: '' },
//     addEventListener: jest.fn()
// };

// // Import the board module (this would need to be adapted to how the module is originally structured)

// describe('Board Module', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
        
//         // Reset module state
//         mockSessionStorage.getItem.mockImplementation((key) => {
//             switch(key) {
//                 case 'nickname': return 'TestPlayer';
//                 case 'session': return 'testSession123';
//                 default: return null;
//             }
//         });
//     });

//     describe('initializeBoard', () => {
//         it('should fetch board and generate board elements', async () => {
//             // Prepare mock board array
//             const mockBoardArray = [
//                 ['.', '#', 'B'],
//                 ['P', 'T', '.']
//             ];
//             mockApiClient.getGameSessionBoard.mockResolvedValue(mockBoardArray);

//             // Mock DOM element
//             const mockGameBoard = {
//                 innerHTML: '',
//                 appendChild: jest.fn()
//             };
//             document.getElementById.mockReturnValue(mockGameBoard);

//             // Call initializeBoard
//             await board.initializeBoard();

//             // Assertions
//             expect(mockApiClient.getGameSessionBoard).toHaveBeenCalledWith("1");
//             expect(mockGameBoard.innerHTML).toBe('');
//             expect(mockGameBoard.appendChild).toHaveBeenCalled();
//         });

//         it('should handle board fetch error', async () => {
//             // Simulate API error
//             const mockError = new Error('Board fetch failed');
//             mockApiClient.getGameSessionBoard.mockRejectedValue({
//                 responseJSON: { error: 'Board fetch failed' }
//             });

//             // Spy on console.log
//             const consoleSpy = jest.spyOn(console, 'log');

//             // Call initializeBoard
//             await board.initializeBoard();

//             // Assertions
//             expect(consoleSpy).toHaveBeenCalledWith(
//                 "Error al obtener el tablero de la sesión:",
//                 "Board fetch failed"
//             );

//             consoleSpy.mockRestore();
//         });
//     });

//     describe('createPositionFromMovement', () => {
//         it('should create correct position for each movement direction', async () => {
//             // Mock movePlayer
//             const movePlayerSpy = jest.spyOn(board, 'movePlayer');
//             movePlayerSpy.mockImplementation(() => Promise.resolve());

//             // Test each movement direction
//             const directions = [
//                 { key: 'LEFT', expectedX: -1, expectedY: 0 },
//                 { key: 'RIGHT', expectedX: 1, expectedY: 0 },
//                 { key: 'UP', expectedX: 0, expectedY: -1 },
//                 { key: 'DOWN', expectedX: 0, expectedY: 1 }
//             ];

//             for (const dir of directions) {
//                 await board.createPositionFromMovement(dir.key);
                
//                 expect(movePlayerSpy).toHaveBeenCalledWith(
//                     expect.objectContaining({
//                         x: dir.expectedX,
//                         y: dir.expectedY
//                     })
//                 );
//             }

//             movePlayerSpy.mockRestore();
//         });

//         it('should handle invalid movement direction', async () => {
//             // Spy on console.log
//             const consoleSpy = jest.spyOn(console, 'log');

//             // Call with invalid direction
//             await board.createPositionFromMovement('INVALID');

//             // Assertions
//             expect(consoleSpy).toHaveBeenCalledWith(
//                 'Dirección inválida:', 'INVALID'
//             );

//             consoleSpy.mockRestore();
//         });
//     });

//     describe('exitFromGameSession', () => {
//         it('should remove player from session and redirect', async () => {
//             // Prepare mocks
//             mockApiClient.removePlayerFromSession.mockResolvedValue();
//             mockStompClient.send.mockResolvedValue();

//             // Call exitFromGameSession
//             await board.exitFromGameSession();

//             // Assertions
//             expect(mockApiClient.removePlayerFromSession).toHaveBeenCalledWith(
//                 'testSession123', 'TestPlayer'
//             );
//             expect(mockStompClient.send).toHaveBeenCalledTimes(2);
//             expect(window.location.href).toBe("./sessionMenu.html");
//             expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('session');
//         });

//         it('should handle exit session error', async () => {
//             // Simulate API error
//             const mockError = new Error('Exit failed');
//             mockApiClient.removePlayerFromSession.mockRejectedValue({
//                 responseJSON: { error: 'Exit failed' }
//             });

//             // Spy on console.log
//             const consoleSpy = jest.spyOn(console, 'log');

//             // Call exitFromGameSession
//             await board.exitFromGameSession();

//             // Assertions
//             expect(consoleSpy).toHaveBeenCalledWith('Exit failed');

//             consoleSpy.mockRestore();
//         });
//     });

//     describe('handleGameStatus', () => {
//         it('should show win modal and disable movements when game is won', () => {
//             // Prepare mock DOM elements
//             const mockModal = { style: {} };
//             const mockControls = { style: {} };

//             document.getElementById.mockImplementation((id) => {
//                 switch(id) {
//                     case 'winModal': return mockModal;
//                     case 'controls': return mockControls;
//                 }
//             });

//             // Call handleGameStatus with true (won)
//             board.handleGameStatus(true);

//             // Assertions
//             expect(mockModal.style.display).toBe('flex');
//             expect(mockControls.style.pointerEvents).toBe('none');
//             expect(mockControls.style.opacity).toBe('0.5');
//         });

//         it('should not show win modal when game is not won', () => {
//             // Prepare mock DOM elements
//             const mockModal = { style: {} };
//             const mockControls = { style: {} };

//             document.getElementById.mockImplementation((id) => {
//                 switch(id) {
//                     case 'winModal': return mockModal;
//                     case 'controls': return mockControls;
//                 }
//             });

//             // Call handleGameStatus with false (not won)
//             board.handleGameStatus(false);

//             // Assertions
//             expect(mockModal.style.display).toBeUndefined();
//             expect(mockControls.style.pointerEvents).toBeUndefined();
//             expect(mockControls.style.opacity).toBeUndefined();
//         });
//     });
// });