const login = (() => {
    let api = apiClient;

    const loginWithMicrosoft = async () => {
        try {
            // Redirect to Azure authentication
            window.location.href = "https://calm-rock-0d4eb650f.5.azurestaticapps.net/oauth2/authorization/aad";
        } catch (error) {
            console.error("Error during authentication: ", error);
        }
    };

    const initializeUserSession = async (displayName, token) => {
        try {
            await handleNickname(displayName);

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("nickname", nickname);

            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
            alert("Hubo un error al iniciar sesión.");
        }
    };

    const handleNickname = async (newNickname) => {
        sessionStorage.clear();

        try {
            const player = await api.verifyNickname(newNickname);
            if (player) {
                alert("El nickname ya está en uso. Por favor elige otro.");
                throw new Error("Nickname en uso.");
            } else {
                await api.login(newNickname);
                sessionStorage.setItem("nickname", newNickname);
            }
        } catch (error) {
            console.error("Error al manejar el nickname:", error);
            throw error;
        }
    };

    const checkAuthentication = async () => {
        try {
            const userInfo = await api.getCorrectInfo();
            if (userInfo?.displayName && userInfo?.token) {
                await initializeUserSession(
                    userInfo.displayName, 
                    userInfo.token
                );
            }
        } catch (error) {
            console.warn("Authentication check failed:", error);
        }
    };
    // const getDisplayName = () => sessionStorage.getItem("nickname");

    return {
        loginWithMicrosoft,
        checkAuthentication,
        getDisplayName: () => sessionStorage.getItem("nickname")
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    login.checkAuthentication();
});