

// Inicialización de MSAL

const login = (() => {
    let api = apiClient;
    let auth = authConfig;


    const initializeUserSession = async () => {
        try {
            const tokenResponse = await auth.getAccessTokenSilent();
            console.log("Access Token:", tokenResponse);
            const response = await api.verifyJwt();
            console.log(response);
            console.log("Nickname:", getDisplayName());
            const player = await api.verifyNickname(getDisplayName())
            if(!player){
                console.log("No existe el jugador, se creará uno nuevo");
                await api.login(getDisplayName());
            }
            window.location.href = "sessionMenu.html";
        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                console.warn("Se requiere interacción del usuario para adquirir el token.");
                await auth.acquireTokenRedirect({
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

