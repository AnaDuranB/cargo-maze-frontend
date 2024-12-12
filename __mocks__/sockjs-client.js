const SockJS = jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
}));

export default SockJS;
