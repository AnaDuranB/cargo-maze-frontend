class PublicClientApplication {
    constructor(config) {
        this.config = config;
    }

    loginPopup() {
        return Promise.resolve({ account: { username: 'mockUser' } });
    }

    logoutPopup() {
        return Promise.resolve();
    }

    getAllAccounts() {
        return [{ username: 'mockUser' }];
    }

    getAccountByUsername(username) {
        return { username };
    }

    acquireTokenSilent() {
        return Promise.resolve({ accessToken: 'mockAccessToken' });
    }

    acquireTokenRedirect() {
        return Promise.resolve({ accessToken: 'mockAccessToken' });
    }
}

module.exports = { PublicClientApplication };
