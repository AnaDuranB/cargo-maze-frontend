import board from '../src/jstest/board'; // Import your board module
import apiClient from '../src/jstest/apiclient';

// Mock dependencies
jest.mock('../src/jstest/apiclient', () => ({
    getGameSessionBoard: jest.fn(),
    getPlayersInSession: jest.fn(),
    removePlayerFromSession: jest.fn()
}));

jest.mock('sockjs-client', () => jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    connect: jest.fn((_, callback) => callback("Connected"))
})));

jest.mock('stompjs', () => ({
    over: jest.fn().mockReturnValue({
        connect: jest.fn(),
        subscribe: jest.fn(),
        send: jest.fn()
    })
}));

describe('Board Module Tests', () => {
    let mockBoardArray;

    beforeEach(() => {
        mockBoardArray = [
            ['.', '.', '.', '#', '.'],
            ['.', 'B', '#', '.', 'T'],
            ['P', '#', '.', 'B', '#'],
            ['.', '.', '.', 'PT', '.'],
            ['#', '#', '#', '.', '.']
        ];
        

        // Reset mock implementations before each test
        apiClient.getGameSessionBoard.mockResolvedValue(mockBoardArray);
        apiClient.getPlayersInSession.mockResolvedValue([{ nickname: 'player1' }]);
        apiClient.removePlayerFromSession.mockResolvedValue(undefined);

        jest.spyOn(document, 'addEventListener').mockImplementation((event, callback) => {
            if (event === 'keydown') {
                document._keydownCallback = callback; // Save the callback for later use
            }
        });
    });
    function flushPromises() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
    
    
    test('should initialize the board correctly', async () => {
        document.body.innerHTML = '<ul id="game-board"></ul>';
        await board.initializeBoard();
    
        // Espera a que todas las promesas se resuelvan antes de proceder
        await flushPromises();
    
        const gameBoard = document.getElementById('game-board');
        const cells = gameBoard.getElementsByClassName('cell');
        console.log(Array.from(cells).map(cell => cell.className)); // Log all class names
        console.log(cells[2].className); // Check the exact class name of the cell

        expect(cells.length).toBe(25); // 5x5 board
        expect(cells[0].classList.contains('empty')).toBe(true);
        expect(cells[2].classList.contains('box')).toBe(false); // Check if 'box' is present
        expect(cells[10].classList.contains('player')).toBe(true);
    });

    test('should handle player movement (left, right, up, down)', async () => {
        const movePlayerMock = jest.spyOn(board, 'movePlayer');
        
        // Manually dispatch keydown events for movement
        const leftEvent = new KeyboardEvent('keydown', { key: 'a' });
        document.dispatchEvent(leftEvent); // Left
        await flushPromises();  // Ensure promises are resolved (if needed)
        expect(movePlayerMock).toHaveBeenCalledWith(expect.objectContaining({ x: -1, y: 0 }));
    
        const rightEvent = new KeyboardEvent('keydown', { key: 'd' });
        document.dispatchEvent(rightEvent); // Right
        await flushPromises();  // Ensure promises are resolved (if needed)
        expect(movePlayerMock).toHaveBeenCalledWith(expect.objectContaining({ x: 1, y: 0 }));
    
        const upEvent = new KeyboardEvent('keydown', { key: 'w' });
        document.dispatchEvent(upEvent); // Up
        await flushPromises();  // Ensure promises are resolved (if needed)
        expect(movePlayerMock).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: -1 }));
    
        const downEvent = new KeyboardEvent('keydown', { key: 's' });
        document.dispatchEvent(downEvent); // Down
        await flushPromises();  // Ensure promises are resolved (if needed)
        expect(movePlayerMock).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: 1 }));
    });
    
    
    

    
    
    

    test('should call movePlayer when createPositionFromMovement is triggered', async () => {
        const movePlayerSpy = jest.spyOn(board, 'movePlayer');
        const position = new board.Position(0, 1);  // Ensure Position is part of the board module
    
        await board.createPositionFromMovement('DOWN'); // Moves player down
        expect(movePlayerSpy).toHaveBeenCalledWith(position);
    });
    

    test('should show the win modal and disable movements when game is won', () => {
        document.body.innerHTML = '<div id="winModal" style="display:none"></div>';
        const modal = document.getElementById('winModal');
    
        // Trigger game won status
        board.handleGameStatus(true);
    
        expect(modal.style.display).toBe('flex');
        const controls = document.getElementById('controls');
        expect(controls.style.pointerEvents).toBe('none');
        expect(controls.style.opacity).toBe('0.5');
    });
    
});

