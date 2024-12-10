// Configuración de MSAL
const msalConfig = {
    auth: { 
        clientId: "bd798536-2348-457e-b5d8-1a138c147eab",
        authority: "https://login.microsoftonline.com/ac3a534a-d5d6-42f6-aa4f-9dd5fbef911f",
        redirectUri: "https://calm-rock-0d4eb650f.5.azurestaticapps.net/sessionMenu.html",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const login = (() => {
    let api = apiClient;

    const loginWithMicrosoft = async () => {
        try {
            await msalInstance.loginRedirect({
                scopes: ["openid", "profile", "email"],
            });
        } catch (error) {
            console.error("Error during authentication: ", error);
        }
    };

    const initializeUserSession = async () => {
        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length === 0) {
                console.warn("No se encontraron cuentas autenticadas.");
                return;
            }

            const account = accounts[0];
            sessionStorage.setItem("nickname", account.username);
            console.log("Sesión iniciada para:", account.username);

            // Opcional: Si necesitas un token de acceso para APIs protegidas
            const tokenResponse = await msalInstance.acquireTokenSilent({
                account,
                scopes: ["User.Read"], // Ajusta los scopes según tus necesidades
            });
            console.log("Access Token:", tokenResponse.accessToken);

            await api.login(newNickname);

            window.location.href = "./sessionMenu.html";
        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                console.warn("Se requiere interacción del usuario para adquirir el token.");
                await msalInstance.acquireTokenRedirect({
                    scopes: ["User.Read"],
                });
            } else {
                console.error("Error al inicializar la sesión:", error);
            }
        }
    };

    const getDisplayName = () => {
        return sessionStorage.getItem("nickname");
    };

    const logout = async () => {
        try {
            await msalInstance.logoutRedirect();
            sessionStorage.clear(); // Limpia los datos de la sesión
            console.log("Sesión cerrada.");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const init = async () => {
        try {
            // Procesa el hash de redirección después del login
            const redirectResponse = await msalInstance.handleRedirectPromise();
            if (redirectResponse) {
                console.log("Respuesta de redirección recibida:", redirectResponse);
                const account = redirectResponse.account;
                sessionStorage.setItem("nickname", account.username);
                console.log("Nickname guardado:", account.username);
            } else {
                // Si no hay redirección, verifica si ya hay cuentas en caché
                const accounts = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    const account = accounts[0];
                    sessionStorage.setItem("nickname", account.username);
                    console.log("Cuenta detectada en caché:", account.username);
                } else {
                    console.warn("No se encontraron cuentas autenticadas.");
                }
            }
    
            // Inicializa la sesión del usuario si está autenticado
            await initializeUserSession();
        } catch (error) {
            console.error("Error durante la inicialización:", error);
        }
    };
    

    return {
        loginWithMicrosoft,
        initializeUserSession,
        getDisplayName,
        logout,
        init,
    };
})();

login.init();
