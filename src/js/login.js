const login = (() => {
    let api = apiClient;
    let nickname = sessionStorage.getItem('nickname');
    let auth = authConfig;


    const initializeUserSession = async () => {
        try {
            const player = await api.verifyNickname(nickname)
            if(!player){
                console.log("No existe el jugador, se creará uno nuevo");

                api.login(nickname);
            }
            else{
                console.log("El jugador ya existe");
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

