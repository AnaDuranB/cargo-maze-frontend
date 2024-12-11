const msalConfig = {
    auth: { 
        clientId: "bd798536-2348-457e-b5d8-1a138c147eab",
        authority: "https://login.microsoftonline.com/ac3a534a-d5d6-42f6-aa4f-9dd5fbef911f",
        redirectUri: "http://localhost:4200/successLogin.html", // Asegúrate de que esta URL esté registrada en Azure
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "sessionStorage",  // Usamos sessionStorage para persistencia temporal
        storeAuthStateInCookie: false,   // No almacenar el estado de autenticación en cookies
    },
};

const myMSALObj = new msal.PublicClientApplication(msalConfig);

let username = "";
let account = null;

const authConfig = (() => {

    function selectAccount () {

        /**
         * See here for more info on account retrieval: 
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
         */
    
        const currentAccounts = myMSALObj.getAllAccounts();
    
        if (!currentAccounts  || currentAccounts.length < 1) {
            return;
    
        } else if (currentAccounts.length > 1) {
            console.warn("Multiple accounts detected.");
        
        } else if (currentAccounts.length === 1) {
            account = currentAccounts[0];
            username = currentAccounts[0].username;
        }
    }
    
    function signIn() {
        myMSALObj.loginPopup(
            {
            scopes: ["openid", "profile", "email"]
            })
            .then(handleResponse)
            .catch(error => {
                console.error(error);
            });
    }
        
    
    function signOut() {
    
        /**
         * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
         */
    
        // Choose which account to logout from by passing a username.
        const logoutRequest = {
            account: myMSALObj.getAccountByUsername(username),
            mainWindowRedirectUri: 'http://localhost:3000/signout',
            redirectUri: 'http://localhost:3000/redirect.html',
        };
    
        myMSALObj.logoutPopup(logoutRequest);
    }
    
    
    function handleResponse (response) {
        if (response) {
            console.log("Respuesta de redirección recibida:", response);
            const accounts = myMSALObj.getAllAccounts();
            if (accounts.length > 0) {
                account = accounts[0];
                sessionStorage.setItem("nickname", account.username);
                console.log("Cuenta autenticada detectada:", account.username);
            } else {
                console.warn("No se encontraron cuentas autenticadas.");
            }
            login.initializeUserSession();
        } else {
            console.warn("No se recibió respuesta de redirección.");
        }
    };
    
    async function getAccessTokenSilent(tokenRequest) {
    
        try {
            const tokenResponse = await myMSALObj.acquireTokenSilent(
            {
                scopes: ["openid", "profile", "email"],
                account: account,
            });
    
            return tokenResponse.accessToken;
        } catch (error) {
            console.error("Error al obtener el token:", error);
    
            if (error.name === "InteractionRequiredAuthError") {
                // Si se requiere interacción, redirigir a la página de login
                await window.myMSALObj.acquireTokenRedirect(tokenRequest);
            } else {
                throw error;
            }
        }
    };
    
    
    async function getAccessTokenDirect(params) {
        return await myMSALObj.acquireTokenRedirect(params);
    }
    selectAccount();
    
    return {
        signIn,
        signOut,
        getAccessTokenSilent,
        getAccessTokenDirect,
        init: () => {
            selectAccount();
        }
    }
})();
authConfig.init();


