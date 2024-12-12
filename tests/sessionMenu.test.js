import sessionMenu from '../src/jstest/sessionMenu';
import apiClient from '../src/jstest/apiclient';
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

// Mock dependencies
jest.mock('sockjs-client');
jest.mock('stompjs', () => {
    const mockSubscription = { 
        unsubscribe: jest.fn() 
    };
    
    return {
        over: jest.fn().mockReturnValue({
            connect: jest.fn((_, successCallback) => {
                // Simulate successful connection
                successCallback('mock frame');
            }),
            subscribe: jest.fn().mockReturnValue(mockSubscription),
            send: jest.fn(),
            disconnect: jest.fn(),
            connected: true
        })
    };
});
jest.mock('../src/jstest/apiclient');

describe('sessionMenu', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup sessionStorage mock
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn().mockReturnValue(''),
                setItem: jest.fn()
            },
            writable: true
        });

        // Setup window.location mock
        delete window.location;
        window.location = { href: '' };

        // Reset sessionMenu internal state
        sessionMenu._setNickname('testUser');
    });

    test('should enter session with valid nickname', async () => {
        // Mock API and location
        apiClient.enterSession.mockResolvedValue({});
        
        await sessionMenu.enterSession('1');
        
        expect(apiClient.enterSession).toHaveBeenCalledWith('1', 'testUser');
        expect(window.location.href).toBe('game.html');
    });


});