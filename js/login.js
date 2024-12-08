const login = (() => {
    let api = apiClient;

    const loginWithMicrosoft = async () => {
        try {
            // Redirect to Azure authentication
            window.location.href = "http://localhost:8080/oauth2/authorization/aad";
        } catch (error) {
            console.error("Error during authentication: ", error);
        }
    };

    const initializeUserSession = async () => {
        try {
            const queryParams = new URLSearchParams(window.location.search);

            const token = queryParams.get("token");
            const displayName = queryParams.get("displayName");

            console.log("Token:", token);
            console.log("DisplayName:", displayName);

            if (token == null || displayName == null) {
                throw new Error("Token o DisplayName no están presentes en la URL.");
            }
            await handleNickname(displayName);

            sessionStorage.setItem("token", token);

            console.log(sessionStorage.getItem("nickname"));
            console.log(sessionStorage.getItem("token"));

            //window.location.href = "./sessionMenu.html";

        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
        }
    };

    const handleNickname = async (newNickname) => {
        sessionStorage.clear();
        try {
            const player = await api.verifyNickname(newNickname);
            if (player) {
                sessionStorage.setItem("nickname", newNickname);
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
        getDisplayName: () => sessionStorage.getItem("nickname"),
        init: function () {
            initializeUserSession();
        }
    };
})();
login.init();