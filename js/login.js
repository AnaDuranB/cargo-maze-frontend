const login = (() => {
    let api = apiClient;

    const loginWithMicrosoft = async () => {
        try {
            window.location.href = "https://proyectoarsw.duckdns.org/cargoMaze/login/oauth2/authorization/aad";
        } catch (error) {
            console.error("Error during authentication: ", error);
        }
    };

    const initializeUserSession = async () => {
        try {
            const nickname = sessionStorage.getItem("nickname");
            if (!nickname) {
                console.error("Nickname no encontrado en sessionStorage.");
                return;
            }

            await handleNickname(nickname);
            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
        }
    };

    const handleNickname = async (newNickname) => {
        try {
            const player = await api.verifyNickname(newNickname);
            if (!player) {
                await api.login(newNickname);
            }
            console.log("Player:", player);
        } catch (error) {
            console.error("Error al manejar el nickname:", error);
            throw error;
        }
    };

    const getDisplayNameFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("displayName");
    };

    const init = () => {
        const displayName = getDisplayNameFromURL();
        if (displayName) {
            sessionStorage.setItem("nickname", displayName);
            console.log("Nickname guardado:", displayName);
            initializeUserSession();
        } else {
            console.warn("No se encontró displayName en la URL.");
        }
    };

    return {
        loginWithMicrosoft,
        getDisplayName: () => sessionStorage.getItem("nickname"),
        init,
    };
})();

// Llamada inicial para capturar el displayName de la URL después de la redirección
login.init();
