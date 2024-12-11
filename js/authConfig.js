const msalConfig = {
    auth: { 
        clientId: "bd798536-2348-457e-b5d8-1a138c147eab",
        authority: "https://login.microsoftonline.com/ac3a534a-d5d6-42f6-aa4f-9dd5fbef911f",
        redirectUri: "http://localhost/successLogin.html", // Asegúrate de que esta URL esté registrada en Azure
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "localStorage",  // Usamos sessionStorage para persistencia temporal
        storeAuthStateInCookie: true,   // No almacenar el estado de autenticación en cookies
    },
};

const myMSALObj = new msal.PublicClientApplication(msalConfig);

let username = "";

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
        username = currentAccounts[0].username;
    }
}

function signIn(loginRequest) {
    myMSALObj.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.error(error);
        });
}
    


async function logout() {
    try {
        await msalInstance.logoutRedirect(); 
        sessionStorage.clear();  
        console.log("Sesión cerrada.");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};


function handleResponse (response) {
    if (response) {
        console.log("Respuesta de redirección recibida:", response);
        const account = response.account;
        if (account) {
            sessionStorage.setItem("nickname", account.username);
            console.log("Sesión iniciada para:", account.username);
        }
    } else {
        // Si no hay respuesta, verifica si hay cuentas disponibles
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            const account = accounts[0];
            sessionStorage.setItem("nickname", account.username);
            console.log("Cuenta autenticada detectada:", account.username);
        } else {
            console.warn("No se encontraron cuentas autenticadas.");
        }
    }
};

async function getAccessToken () {

    const accounts = myMSALObj.getAllAccounts();
    if (accounts.length === 0) {
        throw new Error("No se encontró ninguna cuenta autenticada.");
    }

    const account = accounts[0];
    const tokenRequest = {
        scopes: ["openid", "profile", "email"],
        account: account,
    };

    try {
        const tokenResponse = await myMSALObj.acquireTokenSilent(tokenRequest);
        return tokenResponse.accessToken;
    } catch (error) {
        console.error("Error al obtener el token:", error);

        if (error.name === "InteractionRequiredAuthError") {
            // Si se requiere interacción, redirigir a la página de login
            await window.msalInstance.acquireTokenRedirect(tokenRequest);
        } else {
            throw error;
        }
    }
};

selectAccount();