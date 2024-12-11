

// Inicialización de MSAL

const login = (() => {
    let api = apiClient;
    let nickname = sessionStorage.getItem('nickname');


    const initializeUserSession = async () => {
        try {
            const tokenResponse = await getAccessToken();
            console.log("Access Token:", tokenResponse.accessToken);
            const player = await api.verifyNickname(nickname)
            if(!player){
                api.login(nickname);
            }

        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                console.warn("Se requiere interacción del usuario para adquirir el token.");
                await acquireTokenRedirect({
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

    return {
        initializeUserSession,
        getDisplayName
    };
})();

