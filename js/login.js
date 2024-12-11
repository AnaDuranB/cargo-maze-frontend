

// Inicialización de MSAL


const login = (() => {
    let api = apiClient;
    let auth = authConfuig

    const loginWithMicrosoft = async () => {
        try {
            // Inicia la redirección de login
            auth.signIn({
                scopes: ["openid", "profile", "email"]
            });
            console.log("Redirección iniciada correctamente.");
        } catch (error) {
            console.error("Error durante la autenticación: ", error);
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

            const tokenResponse = await msalInstance.acquireTokenSilent({
                account: account,
                scopes: ["openid", "profile", "email"],
            });
            console.log("Access Token:", tokenResponse.accessToken);

            api.login(account.username);

            //window.location.href = "./sessionMenu.html";
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

    
    const initMSAL =  () => {
        const msalInstance = new msal.PublicClientApplication(msalConfig);
        console.log("instancua msal",msalInstance);
        window.msalInstance = window.msalInstance == null ?  msalInstance: window.msalInstance; 
        console.log("window ", window.msalInstance);
    }


    const init = async () => {
        console.log("Initializing...");
    
        try {
            // Maneja la respuesta del redireccionamiento
            await msalInstance.handleRedirectPromise()
                .then(handleResponse)
                .catch((error) => {
                    console.error("Error durante handleRedirectPromise:", error);
                });
    
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length === 0) {
                console.warn("No se encontraron cuentas autenticadas después de manejar el redireccionamiento.");
                return;
            }
    
            const account = accounts[0];
            sessionStorage.setItem("nickname", account.username);
            console.log("Sesión iniciada para:", account.username);
    
            // Intenta inicializar la sesión
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
